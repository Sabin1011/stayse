import type { Request, Response, NextFunction } from "express";
import type { LogoutUser } from "../../../application/use-cases/logout-user.use-case.js";

import {
  REFRESH_COOKIE_NAME,
  refreshCookieClearOptions,
} from "../../../config/cookie.config.js";

export class LogoutController {
  constructor(private readonly logoutUser: LogoutUser) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

      await this.logoutUser.execute(refreshToken);

      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieClearOptions);

      res.status(200).json({
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  };
}