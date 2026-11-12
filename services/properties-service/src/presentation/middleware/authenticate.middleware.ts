import type { Request, Response, NextFunction } from "express";

import type { AccessTokenVerifier } from "../../application/interfaces/security/access-token-verifier.interface.js";

import type { AuthenticatedRequest } from "../types/authenticated-request.js";

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

export class AuthenticateMiddleware {
  constructor(
    private readonly accessTokenVerifier: AccessTokenVerifier,
  ) {}

  handle = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader?.startsWith("Bearer ")) {
        res.status(401).json({
          message: "Authentication token is required",
        });
        return;
      }

      const token = authorizationHeader.substring(7).trim();

      if (!token) {
        res.status(401).json({
          message: "Authentication token is required",
        });
        return;
      }

    const user = this.accessTokenVerifier.verify(token);

    (req as AuthenticatedRequest).auth = {
    userId: user.userId,
    roles: [],
    };

    next();

    } catch {
      res.status(401).json({
        message: "Invalid or expired access token",
      });
    }
  };
}