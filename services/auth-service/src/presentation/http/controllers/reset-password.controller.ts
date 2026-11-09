import type { Request, Response, NextFunction } from "express";

import type { ResetPassword } from "../../../application/use-cases/reset-password.use-case.js";

import { resetPasswordSchema } from "../validators/reset-password.validator.js";

export class ResetPasswordController {
  constructor(
    private readonly resetPassword: ResetPassword,
  ) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const validation = resetPasswordSchema.safeParse(req.body);

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
      await this.resetPassword.execute(validation.data);

      res.status(200).json({
        message: "Password reset successfully. Please sign in again.",
      });
    } catch (error) {
      next(error);
    }
  };
}