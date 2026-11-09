import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";
import type { VerificationChallengeRepository } from "../interfaces/repositories/verification-challenge-repository.interface.js";

import type { OtpGenerator } from "../interfaces/security/otp-generator.interface.js";
import type { OtpHasher } from "../interfaces/security/otp-hasher.interface.js";
import type { EmailSender } from "../interfaces/email/email-sender.interface.js";

import { VerificationChallenge } from "../../domain/entities/verification-challenge.entity.js";

export interface RequestPasswordResetOtpInput {
  email: string;
}

export class RequestPasswordResetOtp {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly challengeRepository: VerificationChallengeRepository,
    private readonly otpGenerator: OtpGenerator,
    private readonly otpHasher: OtpHasher,
    private readonly emailSender: EmailSender,
  ) {}

  async execute(input: RequestPasswordResetOtpInput): Promise<void> {
    const email = input.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(email);

    // Always return a generic response for ineligible accounts.
    if (
      !user ||
      user.status !== "active" ||
      !user.isEmailVerified ||
      !user.id
    ) {
      return;
    }

    // Enforce the 30-second resend cooldown.
    const latestChallenge =
      await this.challengeRepository.findLatestByTargetAndType(
        email,
        "password_reset",
      );

    if (latestChallenge) {
      const elapsedMs =
        Date.now() - latestChallenge.createdAt.getTime();

      if (elapsedMs < 30_000) {
        return;
      }
    }

    const otp = this.otpGenerator.generate();
    const tokenHash = this.otpHasher.hash(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.challengeRepository.invalidateActiveByTargetAndType(
      email,
      "password_reset",
    );

    const challenge = VerificationChallenge.create({
      userId: user.id,
      challengeType: "password_reset",
      target: email,
      tokenHash,
      expiresAt,
      maxAttempts: 5,
    });

    await this.challengeRepository.create({
      userId: user.id,
      challengeType: challenge.challengeType,
      target: challenge.target,
      tokenHash: challenge.tokenHash,
      expiresAt: challenge.expiresAt,
      maxAttempts: challenge.maxAttempts,
    });

    await this.emailSender.sendEmail(
      email,
      "Reset your Stayse password",
      `Your Stayse password reset code is ${otp}. It expires in 5 minutes. If you did not request this, you can ignore this email.`,
    );
  }
}
