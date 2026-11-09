import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";
import type { RefreshSessionRepository } from "../interfaces/repositories/refresh-session-repository.interface.js";

import type { AccessTokenGenerator } from "../interfaces/security/access-token-generator.interface.js";
import type { RefreshTokenGenerator } from "../interfaces/security/refresh-token-generator.interface.js";

import { AppError } from "../errors/app-error.js";

interface RefreshAccessTokenResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshAccessToken {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly accessTokenGenerator: AccessTokenGenerator,
    private readonly refreshTokenGenerator: RefreshTokenGenerator,
  ) {}

  async execute(refreshToken: string): Promise<RefreshAccessTokenResult> {
    if (!refreshToken) {
      throw new AppError(
        "Refresh token is required",
        "REFRESH_TOKEN_REQUIRED",
      );
    }

    const tokenHash = this.refreshTokenGenerator.hash(refreshToken);

    const oldSession =
      await this.refreshSessionRepository.findActiveByTokenHash(tokenHash);

    if (!oldSession) {
      throw new AppError(
        "Invalid or expired refresh token",
        "INVALID_REFRESH_TOKEN",
      );
    }

    const user = await this.userRepository.findById(oldSession.userId);

    if (!user || user.status !== "active" || !user.isEmailVerified) {
      throw new AppError(
        "User is not authorized to refresh tokens",
        "USER_NOT_AUTHORIZED",
      );
    }

    if (!user.id) {
      throw new AppError("User ID is missing", "INVALID_USER_ID");
    }

    const newAccessToken = this.accessTokenGenerator.generate({
      userId: user.id,
      email: user.email.getValue(),
    });

    const newRefreshToken = this.refreshTokenGenerator.generate();

    const newTokenHash = this.refreshTokenGenerator.hash(newRefreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshSessionRepository.rotate(oldSession.id, {
      userId: user.id,
      tokenHash: newTokenHash,
      familyId: oldSession.familyId,
      expiresAt,
      userAgent: oldSession.userAgent,
      ipAddress: oldSession.ipAddress,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}