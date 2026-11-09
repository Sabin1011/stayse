
import type {Request, Response, NextFunction } from "express";
import type { UserRepository } from "../../../application/interfaces/repositories/user-repository.interface.js";
import type { AuthenticatedUser } from "./authenticate.middleware.js";

export class AuthorizeRolesMiddleware {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  require = (...allowedRoles: string[]) => {
    return async (
      _req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      try {
        const authenticatedUser = res.locals
          .authenticatedUser as AuthenticatedUser | undefined;

        if (!authenticatedUser) {
          res.status(401).json({
            message: "Authentication required",
          });
          return;
        }

        const userRoles =
          await this.userRepository.findRolesByUserId(
            authenticatedUser.userId,
          );

        const hasRequiredRole = userRoles.some((role) =>
          allowedRoles.includes(role),
        );

        if (!hasRequiredRole) {
          res.status(403).json({
            message: "You do not have permission to access this resource",
          });
          return;
        }

        next();
      } catch {
        res.status(500).json({
          message: "Unable to verify user permissions",
        });
      }
    };
  };
}
