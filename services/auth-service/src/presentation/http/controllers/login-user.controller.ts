import type { Request, Response, NextFunction } from "express";
import type { LoginUser } from "../../../application/use-cases/login-user.use-case.js";
import { loginUserSchema } from "../validators/login-user.validator.js";
import {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from "../../../config/cookie.config.js";

export class LoginUserController {
  constructor(private readonly loginUser: LoginUser) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input = loginUserSchema.parse(req.body);

      const result = await this.loginUser.execute({
        email: input.email,
        password: input.password,
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
        message: "Login successful",
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };
}