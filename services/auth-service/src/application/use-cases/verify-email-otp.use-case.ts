import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";

import type { VerificationChallengeRepository } from "../interfaces/repositories/verification-challenge-repository.interface.js";

import type { OtpHasher } from "../interfaces/security/otp-hasher.interface.js";

import { AppError } from "../errors/app-error.js";

interface VerifyEmailOtpInput {
  email: string;
  otp: string;
}

export class VerifyEmailOtp {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly challengeRepository: VerificationChallengeRepository,
    private readonly otpHasher: OtpHasher,
  ) {}

  async execute(input: VerifyEmailOtpInput): Promise<void> {
    // 1. Find the active verification challenge
    const challenge =
      await this.challengeRepository.findActiveByTargetAndType(
        input.email,
        "email_verification",
      );

    if (!challenge) {
      throw new AppError(
        "Invalid or expired verification code",
        "INVALID_OR_EXPIRED_OTP",
      );
    }

    // 2. Verify the submitted OTP
    const isValid = this.otpHasher.verify(
      input.otp,
      challenge.tokenHash,
    );

    // 3. If OTP is incorrect, increment failed attempts
    if (!isValid) {
      await this.challengeRepository.incrementAttemptCount(
        challenge.id!,
      );

      throw new AppError(
        "Incorrect verification code",
        "INVALID_OTP",
      );
    }

    // 4. Find the associated user
    if (!challenge.userId) {
      throw new AppError(
        "Verification challenge has no associated user",
        "INVALID_CHALLENGE_USER",
      );
    }

    const user = await this.userRepository.findById(
      challenge.userId,
    );

    if (!user) {
      throw new AppError(
        "User not found",
        "USER_NOT_FOUND",
      );
    }

    // 5. Consume the OTP challenge
    await this.challengeRepository.consume(challenge.id!);

    // 6. Verify the user's email in the domain entity
    user.verifyEmail();

    // 7. Persist the updated user
    await this.userRepository.update(user);
  }
}