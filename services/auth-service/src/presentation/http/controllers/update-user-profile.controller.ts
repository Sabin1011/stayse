import type { Request, Response, NextFunction } from "express";
import type { UpdateUserProfileUseCase } from "../../../application/use-cases/update-user-profile.use-case.js";

export class UpdateUserProfileController {
  constructor(
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
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

      const { fullName } = req.body;

      const user = await this.updateUserProfileUseCase.execute({
        userId: authenticatedUser.userId,
        fullName,
      });

      res.status(200).json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}