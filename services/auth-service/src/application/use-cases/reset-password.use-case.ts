import type { PasswordHasher } from "../interfaces/security/password-hasher.interface.js";

import type { PasswordResetGrantRepository } from "../interfaces/repositories/password-reset-grant-repository.interface.js";

import type { PasswordResetTokenGenerator } from "../interfaces/security/password-reset-token-generator.interface.js";

import { AppError } from "../errors/app-error.js";

interface ResetPasswordInput {
  resetToken: string;
  newPassword: string;
}

export class ResetPassword {
  constructor(
    private readonly grantRepository: PasswordResetGrantRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly resetTokenGenerator: PasswordResetTokenGenerator,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    if (
      !input.resetToken ||
      input.resetToken.trim().length === 0
    ) {
      throw new AppError(
        "Password reset authorization is required",
        "RESET_TOKEN_REQUIRED",
      );
    }

    if (
      input.newPassword.length < 8 ||
      input.newPassword.length > 72
    ) {
      throw new AppError(
        "Password must contain between 8 and 72 characters",
        "INVALID_NEW_PASSWORD",
      );
    }

    // Hash the grant before looking it up.
    const tokenHash = this.resetTokenGenerator.hash(
      input.resetToken,
    );

    // Hash the new password using the existing bcrypt implementation.
    const passwordHash = await this.passwordHasher.hash(
      input.newPassword,
    );

    // The repository performs the complete operation atomically.
    const wasReset = await this.grantRepository.consumeAndResetPassword(
      tokenHash,
      passwordHash,
    );

    if (!wasReset) {
      throw new AppError(
        "Invalid, expired, or already used password reset authorization",
        "INVALID_OR_EXPIRED_RESET_GRANT",
      );
    }
  }
}