import type { UserRepository } from "../interfaces/repositories/user-repository.interface.js";
import type { VerificationChallengeRepository } from "../interfaces/repositories/verification-challenge-repository.interface.js";
import type { OtpGenerator } from "../interfaces/security/otp-generator.interface.js";
import type { OtpHasher } from "../interfaces/security/otp-hasher.interface.js";
import type { EmailSender } from "../interfaces/email/email-sender.interface.js";

import { VerificationChallenge } from "../../domain/entities/verification-challenge.entity.js";
import { AppError } from "../errors/app-error.js";

interface SendEmailVerificationOtpInput {
  userId: string;
}

export class SendEmailVerificationOtp {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly challengeRepository: VerificationChallengeRepository,
    private readonly otpGenerator: OtpGenerator,
    private readonly otpHasher: OtpHasher,
    private readonly emailSender: EmailSender,
  ) {}

  async execute(input: SendEmailVerificationOtpInput): Promise<void> {
    // Find the user
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new AppError("User not found", "USER_NOT_FOUND");
    }

    if (user.status !== "pending_verification") {
      throw new AppError(
        "User does not require email verification",
        "EMAIL_VERIFICATION_NOT_REQUIRED",
      );
    }
    // Check resend cooldown
    const latestChallenge =
      await this.challengeRepository.findLatestByTargetAndType(
        user.email.getValue(),
        "email_verification",
      );

    if (latestChallenge) {
      const cooldownMs = 30 * 1000;

      const elapsedMs =
        Date.now() - latestChallenge.createdAt.getTime();

      if (elapsedMs < cooldownMs) {
        const remainingSeconds = Math.ceil(
          (cooldownMs - elapsedMs) / 1000,
        );

        throw new AppError(
          `Please wait ${remainingSeconds} seconds before requesting another OTP`,
          "OTP_RESEND_COOLDOWN",
        );
      }
    }

    // Generate OTP
    const otp = this.otpGenerator.generate();

    // Hash OTP
    const tokenHash = this.otpHasher.hash(otp);

    // Set expiry to 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate previous active challenge
    await this.challengeRepository.invalidateActiveByTargetAndType(
      user.email.getValue(),
      "email_verification",
    );

    // Create new challenge entity
    const challenge = VerificationChallenge.create({
      userId: input.userId,
      challengeType: "email_verification",
      target: user.email.getValue(),
      tokenHash,
      expiresAt,
    });

    // Save challenge
    await this.challengeRepository.create({
      userId: challenge.userId!,
      challengeType: challenge.challengeType,
      target: challenge.target,
      tokenHash: challenge.tokenHash,
      expiresAt: challenge.expiresAt,
      maxAttempts: challenge.maxAttempts,
    });

    // Send OTP through email
    await this.emailSender.sendEmail(
      user.email.getValue(),
      "Verify your Stayse account",
      `Your Stayse verification code is ${otp}. It expires in 5 minutes.`,
    );
  }
}