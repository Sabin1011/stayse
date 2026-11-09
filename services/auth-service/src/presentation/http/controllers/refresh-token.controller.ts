import type { Request, Response, NextFunction } from "express";

import type { RefreshAccessToken } from "../../../application/use-cases/refresh-access-token.use-case.js";

import {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from "../../../config/cookie.config.js";

export class RefreshTokenController {
  constructor(
    private readonly refreshAccessToken: RefreshAccessToken,
  ) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

      if (!refreshToken) {
        res.status(401).json({
          message: "Refresh token is required",
        });
        return;
      }

      const result = await this.refreshAccessToken.execute(refreshToken);

      res.cookie(
        REFRESH_COOKIE_NAME,
        result.refreshToken,
        refreshCookieOptions,
      );

      res.status(200).json({
        message: "Token refreshed successfully",
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };
}