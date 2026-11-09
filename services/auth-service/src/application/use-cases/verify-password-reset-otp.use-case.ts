import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";
import type { VerificationChallengeRepository } from "../interfaces/repositories/verification-challenge-repository.interface.js";
import type { PasswordResetGrantRepository } from "../interfaces/repositories/password-reset-grant-repository.interface.js";

import type { OtpHasher } from "../interfaces/security/otp-hasher.interface.js";
import type { PasswordResetTokenGenerator } from "../interfaces/security/password-reset-token-generator.interface.js";

import { AppError } from "../errors/app-error.js";

interface VerifyPasswordResetOtpInput {
  email: string;
  otp: string;
}

export interface VerifyPasswordResetOtpResult {
  resetToken: string;
}

export class VerifyPasswordResetOtp {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly challengeRepository: VerificationChallengeRepository,
    private readonly grantRepository: PasswordResetGrantRepository,
    private readonly otpHasher: OtpHasher,
    private readonly resetTokenGenerator: PasswordResetTokenGenerator,
  ) {}

  async execute(
    input: VerifyPasswordResetOtpInput,
  ): Promise<VerifyPasswordResetOtpResult> {
    const email = input.email.trim().toLowerCase();

    // 1. Find the active password-reset challenge.
    const challenge =
      await this.challengeRepository.findActiveByTargetAndType(
        email,
        "password_reset",
      );

    if (!challenge) {
      throw new AppError(
        "Invalid or expired password reset code",
        "INVALID_OR_EXPIRED_RESET_OTP",
      );
    }

    // 2. Check the submitted OTP.
    const isValid = this.otpHasher.verify(
      input.otp,
      challenge.tokenHash,
    );

    if (!isValid) {
      await this.challengeRepository.incrementAttemptCount(
        challenge.id!,
      );

      throw new AppError(
        "Incorrect password reset code",
        "INVALID_RESET_OTP",
      );
    }

    // 3. Find and validate the associated account.
    if (!challenge.userId || !challenge.id) {
      throw new AppError(
        "Invalid password reset challenge",
        "INVALID_RESET_CHALLENGE",
      );
    }

    const user = await this.userRepository.findById(
      challenge.userId,
    );

    if (
      !user ||
      user.status !== "active" ||
      !user.isEmailVerified
    ) {
      throw new AppError(
        "Password reset is not available",
        "PASSWORD_RESET_NOT_AVAILABLE",
      );
    }

    // 4. Consume the OTP so it cannot be reused.
    await this.challengeRepository.consume(challenge.id);

    // 5. Generate a new short-lived reset grant.
    const resetToken = this.resetTokenGenerator.generate();
    const tokenHash = this.resetTokenGenerator.hash(resetToken);

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    // 6. Store only the hashed grant.
    await this.grantRepository.create({
      userId: challenge.userId,
      tokenHash,
      expiresAt,
    });

    return {
      resetToken,
    };
  }
}