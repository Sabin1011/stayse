import type { Request, Response, NextFunction } from "express";

import type { ChangePassword } from "../../../application/use-cases/change-password.use-case.js";

import { changePasswordSchema } from "../validators/change-password.validator.js";

export class ChangePasswordController {
  constructor(
    private readonly changePassword: ChangePassword,
  ) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input = changePasswordSchema.parse(req.body);

      const authenticatedUser = res.locals.authenticatedUser as {
        userId: string;
        email: string;
      };

      await this.changePassword.execute({
        userId: authenticatedUser.userId,
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      });

      res.status(200).json({
        message:
          "Password changed successfully. Please sign in again.",
      });
    } catch (error) {
      next(error);
    }
  };
}