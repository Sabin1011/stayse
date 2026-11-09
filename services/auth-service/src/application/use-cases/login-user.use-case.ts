import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";
import type { RefreshSessionRepository } from "../interfaces/repositories/refresh-session-repository.interface.js";
import type { PasswordHasher } from "../interfaces/security/password-hasher.interface.js";
import type { AccessTokenGenerator } from "../interfaces/security/access-token-generator.interface.js";
import type { RefreshTokenGenerator } from "../interfaces/security/refresh-token-generator.interface.js";

import { AppError } from "../errors/app-error.js";

interface LoginUserInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

interface LoginUserResult {
  accessToken: string;
  refreshToken: string;
}

export class LoginUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly accessTokenGenerator: AccessTokenGenerator,
    private readonly refreshTokenGenerator: RefreshTokenGenerator,
    private readonly refreshSessionRepository: RefreshSessionRepository,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserResult> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", "INVALID_CREDENTIALS");
    }

    if (user.status !== "active" || !user.isEmailVerified) {
      throw new AppError(
        "Please verify your email before logging in",
        "EMAIL_NOT_VERIFIED",
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