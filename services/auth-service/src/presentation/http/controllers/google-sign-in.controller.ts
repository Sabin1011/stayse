import type { Request, Response, NextFunction } from "express";

import type { GoogleSignIn } from "../../../application/use-cases/google-sign-in.use-case.js";

import {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from "../../../config/cookie.config.js";

export class GoogleSignInController {
  constructor(private readonly googleSignIn: GoogleSignIn) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { idToken } = req.body;

      if (typeof idToken !== "string" || !idToken.trim()) {
        res.status(400).json({
          success: false,
          message: "Google ID token is required",
        });
        return;
      }

      const result = await this.googleSignIn.execute({
        idToken,
        ...(req.get("user-agent") && {
          userAgent: req.get("user-agent")!,
        }),
        ...(req.ip && {
          ipAddress: req.ip,
        }),
      });

      res.cookie(
        REFRESH_COOKIE_NAME,
        result.refreshToken,
        refreshCookieOptions,
      );

      res.status(200).json({
        success: true,
        message: "Google sign-in successful",
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };
}