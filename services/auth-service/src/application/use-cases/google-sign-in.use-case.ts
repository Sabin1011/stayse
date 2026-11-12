import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";
import type { ExternalIdentityRepository } from "../interfaces/repositories/external-identity-repository.interface.js";
import type { GoogleIdTokenVerifier } from "../interfaces/security/google-id-token-verifier.interface.js";
import type { AccessTokenGenerator } from "../interfaces/security/access-token-generator.interface.js";
import type { RefreshTokenGenerator } from "../interfaces/security/refresh-token-generator.interface.js";
import type { RefreshSessionRepository } from "../interfaces/repositories/refresh-session-repository.interface.js";

import { AppError } from "../errors/app-error.js";

interface GoogleSignInInput {
  idToken: string;
  userAgent?: string;
  ipAddress?: string;
}

interface GoogleSignInResult {
  accessToken: string;
  refreshToken: string;
}

export class GoogleSignIn {
  constructor(
    private readonly googleIdTokenVerifier: GoogleIdTokenVerifier,
    private readonly userRepository: UserRepository,
    private readonly externalIdentityRepository: ExternalIdentityRepository,
    private readonly accessTokenGenerator: AccessTokenGenerator,
    private readonly refreshTokenGenerator: RefreshTokenGenerator,
    private readonly refreshSessionRepository: RefreshSessionRepository,
  ) {}

  async execute(input: GoogleSignInInput): Promise<GoogleSignInResult> {
    let googleUser;

    try {
      googleUser = await this.googleIdTokenVerifier.verify(input.idToken);
    } catch {
      throw new AppError("Invalid Google ID token", "INVALID_GOOGLE_TOKEN");
    }

    if (!googleUser.emailVerified) {
      throw new AppError(
        "Google email is not verified",
        "GOOGLE_EMAIL_NOT_VERIFIED",
      );
    }

    // First, check whether this Google identity is already linked.
    const externalIdentity =
      await this.externalIdentityRepository.findByProviderUserId(
        "GOOGLE",
        googleUser.googleId,
      );

    let user;

    if (externalIdentity) {
      user = await this.userRepository.findById(externalIdentity.userId);

      if (!user) {
        throw new AppError("User account not found", "USER_NOT_FOUND");
      }
    } else {
      // Check whether a Stayse account already uses this verified email.
      user = await this.userRepository.findByEmail(googleUser.email);

      if (user) {
        if (user.status !== "active") {
          throw new AppError(
            "This account is not active",
            "ACCOUNT_NOT_ACTIVE",
          );
        }

        if (!user.isEmailVerified) {
          throw new AppError(
            "Please complete email verification first",
            "EMAIL_NOT_VERIFIED",
          );
        }
      } else {
        // Create a new active user with the default GUEST role.
        user = await this.userRepository.registerGoogleUser({
          fullName: googleUser.fullName,
          email: googleUser.email,
        });
      }

      if (!user.id) {
        throw new AppError("User ID is missing", "INVALID_USER_ID");
      }

      // Link the Google identity to the Stayse account.
      await this.externalIdentityRepository.create({
        userId: user.id,
        provider: "GOOGLE",
        providerUserId: googleUser.googleId,
        email: googleUser.email,
      });
    }

    if (user.status !== "active" || !user.isEmailVerified) {
      throw new AppError(
        "This account cannot sign in",
        "ACCOUNT_NOT_ACTIVE",
      );
    }

    if (!user.id) {
      throw new AppError("User ID is missing", "INVALID_USER_ID");
    }

    const accessToken = this.accessTokenGenerator.generate({
      userId: user.id,
      email: user.email.getValue(),
    });

    const refreshToken = this.refreshTokenGenerator.generate();
    const tokenHash = this.refreshTokenGenerator.hash(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshSessionRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      ...(input.userAgent !== undefined && {
        userAgent: input.userAgent,
      }),
      ...(input.ipAddress !== undefined && {
        ipAddress: input.ipAddress,
      }),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}