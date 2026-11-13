
import type { Request, Response, NextFunction } from "express";

import type { UploadProfileImageUseCase } from "../../../application/use-cases/upload-profile-image.use-case.js";

export class UploadProfileImageController {
  constructor(
    private readonly uploadProfileImageUseCase: UploadProfileImageUseCase,
  ) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authenticatedUser = res.locals.authenticatedUser as {
        userId: string;
        email: string;
      };

      if (!req.file) {
        res.status(400).json({
          message: "Profile image is required",
        });
        return;
      }

      const user = await this.uploadProfileImageUseCase.execute({
        userId: authenticatedUser.userId,
        file: req.file.buffer,
      });

      res.status(200).json({
        message: "Profile image uploaded successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}
