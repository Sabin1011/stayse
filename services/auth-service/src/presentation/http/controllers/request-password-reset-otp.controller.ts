import type { Request, Response, NextFunction } from "express";

import type { RequestPasswordResetOtp } from "../../../application/use-cases/request-password-reset-otp.use-case.js";

import { requestPasswordResetOtpSchema } from "../validators/request-password-reset-otp.validator.js";

export class RequestPasswordResetOtpController {
  constructor(
    private readonly requestPasswordResetOtp: RequestPasswordResetOtp,
  ) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const validation = requestPasswordResetOtpSchema.safeParse(req.body);

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
      await this.requestPasswordResetOtp.execute(validation.data);

      res.status(200).json({
        message:
          "If an eligible account exists, a password reset code has been sent.",
      });
    } catch (error) {
      next(error);
    }
  };
}