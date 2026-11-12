import type { Request, Response, NextFunction } from "express";
import type { GetCurrentUserUseCase } from "../../../application/use-cases/get-current-user.use-case.js";

export class GetCurrentUserController {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
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

      const user = await this.getCurrentUserUseCase.execute(
        authenticatedUser.userId,
      );

      res.status(200).json({
        message: "User retrieved successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}