
import type { Request, Response, NextFunction } from "express";

import type { UserRepository } from "../../../application/interfaces/repositories/user-repository.interface.js";
import type { SendEmailVerificationOtp } from "../../../application/use-cases/send-email-verification-otp.use-case.js";

import { resendEmailVerificationOtpSchema } from "../validators/resend-email-verification-otp.validator.js";
import { AppError } from "../../../application/errors/app-error.js";

export class ResendEmailVerificationOtpController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sendEmailVerificationOtp: SendEmailVerificationOtp,
  ) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const validation = resendEmailVerificationOtpSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    try {
      const user = await this.userRepository.findByEmail(
        validation.data.email,
      );

      if (!user) {
        throw new AppError(
          "Unable to process verification request",
          "VERIFICATION_REQUEST_FAILED",
        );
      }

    if (!user.id) {
    throw new AppError(
        "Unable to process verification request",
        "VERIFICATION_REQUEST_FAILED",
    );
    }

    await this.sendEmailVerificationOtp.execute({
    userId: user.id,
    });

      res.status(200).json({
        message: "A new verification code has been sent to your email",
      });
    } catch (error) {
      next(error);
    }
  };
}
