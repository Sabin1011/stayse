import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";
import type { RefreshSessionRepository } from "../interfaces/repositories/refresh-session-repository.interface.js";
import type { PasswordHasher } from "../interfaces/security/password-hasher.interface.js";

import { AppError } from "../errors/app-error.js";

interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export class ChangePassword {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const { userId, currentPassword, newPassword } = input;

    if (!currentPassword || !newPassword) {
      throw new AppError(
        "Current password and new password are required",
        "PASSWORD_FIELDS_REQUIRED",
      );
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      throw new AppError(
        "Password must contain between 8 and 72 characters",
        "INVALID_NEW_PASSWORD",
      );
    }

    if (currentPassword === newPassword) {
      throw new AppError(
        "New password must be different from your current password",
        "SAME_PASSWORD",
      );
    }

    const user = await this.userRepository.findById(userId);

    if (!user || user.status !== "active" || !user.isEmailVerified) {
      throw new AppError(
        "User account is not available",
        "USER_NOT_AVAILABLE",
      );
    }

    const isCurrentPasswordValid =
      await this.passwordHasher.compare(
        currentPassword,
        user.passwordHash,
      );

    if (!isCurrentPasswordValid) {
      throw new AppError(
        "Current password is incorrect",
        "INVALID_CURRENT_PASSWORD",
      );
    }

    const newPasswordHash = await this.passwordHasher.hash(newPassword);

    user.changePasswordHash(newPasswordHash);

    await this.userRepository.update(user);

    // Invalidate refresh sessions on all devices.
    await this.refreshSessionRepository.revokeAllForUser(userId);
  }
}