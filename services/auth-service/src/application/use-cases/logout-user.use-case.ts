import type { RefreshSessionRepository } from "../interfaces/repositories/refresh-session-repository.interface.js";
import type { RefreshTokenGenerator } from "../interfaces/security/refresh-token-generator.interface.js";

export class LogoutUser {
  constructor(
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly refreshTokenGenerator: RefreshTokenGenerator,
  ) {}

  async execute(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const tokenHash = this.refreshTokenGenerator.hash(refreshToken);

    const session =
      await this.refreshSessionRepository.findActiveByTokenHash(tokenHash);

    if (!session) {
      return;
    }

    await this.refreshSessionRepository.revoke(session.id);
  }
}