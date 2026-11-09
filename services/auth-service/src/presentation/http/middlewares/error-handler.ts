
import type { ErrorRequestHandler } from "express";

import { AppError } from "../../../application/errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    const conflictErrors = new Set([
      "EMAIL_ALREADY_EXISTS",
    ]);

    const tooManyRequestsErrors = new Set([
      "OTP_RESEND_COOLDOWN",
    ]);

    const statusCode = conflictErrors.has(error.code)
      ? 409
      : tooManyRequestsErrors.has(error.code)
        ? 429
        : 400;

        
    res.status(statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  console.error("Unexpected request error:", error);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
