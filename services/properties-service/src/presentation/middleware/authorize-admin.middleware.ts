import type { Request, Response, NextFunction } from "express";

import type { AuthenticatedRequest } from "../types/authenticated-request.js";

export class AuthorizeAdminMiddleware {
  handle = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    const authenticatedRequest = req as AuthenticatedRequest;

    if (!authenticatedRequest.auth) {
      res.status(401).json({
        message: "Authentication is required",
      });
      return;
    }

    const isAdmin = authenticatedRequest.auth.roles.some(
      (role) => role.toLowerCase() === "admin",
    );

    if (!isAdmin) {
      res.status(403).json({
        message: "Admin access required",
      });
      return;
    }

    next();
  };
}