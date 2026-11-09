import type { Request, Response, NextFunction } from "express";

import type { VerifyEmailOtp } from "../../../application/use-cases/verify-email-otp.use-case.js";

import { verifyEmailOtpSchema } from "../validators/verify-email-otp.validator.js";

export class VerifyEmailOtpController {
  constructor(
    private readonly verifyEmailOtp: VerifyEmailOtp,
  ) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const validation = verifyEmailOtpSchema.safeParse(req.body);

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
      await this.verifyEmailOtp.execute(validation.data);

      res.status(200).json({
        message: "Email verified successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}