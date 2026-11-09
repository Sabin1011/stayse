import type { Request, Response, NextFunction } from "express";

import type { VerifyPasswordResetOtp } from "../../../application/use-cases/verify-password-reset-otp.use-case.js";

import { verifyPasswordResetOtpSchema } from "../validators/verify-password-reset-otp.validator.js";

export class VerifyPasswordResetOtpController {
  constructor(
    private readonly verifyPasswordResetOtp: VerifyPasswordResetOtp,
  ) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const validation = verifyPasswordResetOtpSchema.safeParse(req.body);

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
      const result = await this.verifyPasswordResetOtp.execute(
        validation.data,
      );

      res.status(200).json({
        message: "OTP verified successfully",
        resetToken: result.resetToken,
      });
    } catch (error) {
      next(error);
    }
  };
}