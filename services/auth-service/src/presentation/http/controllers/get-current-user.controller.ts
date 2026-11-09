import type { Request, Response, NextFunction } from "express";
import type { UserRepository } from "../../../application/interfaces/repositories/user-repository.interface.js";

export class GetCurrentUserController {
  constructor(private readonly userRepository: UserRepository) {}

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

      const user = await this.userRepository.findById(
        authenticatedUser.userId,
      );
      const roles = await this.userRepository.findRolesByUserId(
        authenticatedUser.userId,
      );

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        message: "User retrieved successfully",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email.getValue(),
          status: user.status,
          emailVerified: user.isEmailVerified,
          roles,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}