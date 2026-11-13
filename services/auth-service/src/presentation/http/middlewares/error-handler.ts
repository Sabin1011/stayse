
import type { ErrorRequestHandler } from "express";
import multer from "multer";

import { AppError } from "../../../application/errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  // Handle application errors
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

  // Handle Multer upload errors
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: {
          code: "FILE_TOO_LARGE",
          message: "Image must not exceed 5 MB",
        },
      });
      return;
    }

    res.status(400).json({
      error: {
        code: "INVALID_FILE_UPLOAD",
        message: error.message,
      },
    });
    return;
  }

  // Handle invalid file type
  if (
    error instanceof Error &&
    error.message === "Only JPEG, PNG and WebP images are allowed"
  ) {
    res.status(400).json({
      error: {
        code: "INVALID_FILE_TYPE",
        message: error.message,
      },
    });
    return;
  }

  // Handle unexpected errors
  console.error("Unexpected request error:", error);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
