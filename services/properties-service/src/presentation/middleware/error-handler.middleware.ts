import type { ErrorRequestHandler } from "express";

import { HostApplicationError } from "../../domain/errors/host-application.error.js";

import { ActiveHostApplicationExistsError } from "../../domain/errors/active-host-application-exists.error.js";

import { InvalidHostDocumentReferenceError } from "../../domain/errors/invalid-host-document-reference.error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
): void => {
  // Do not attempt to send another response if headers were already sent.
  if (res.headersSent) {
    next(error);
    return;
  }

  // An active application already exists.
  if (error instanceof ActiveHostApplicationExistsError) {
    res.status(409).json({
      message: error.message,
    });
    return;
  }

  // Invalid document references or references belonging to another user.
  if (error instanceof InvalidHostDocumentReferenceError) {
    res.status(400).json({
      message: error.message,
    });
    return;
  }

  // Host application business-rule errors.
  if (error instanceof HostApplicationError) {
    const isStateConflict = error.message.startsWith(
      "Operation not allowed while application is",
    );

    res.status(isStateConflict ? 409 : 400).json({
      message: error.message,
    });
    return;
  }

  // Malformed JSON request body.
  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    res.status(400).json({
      message: "Invalid JSON request body",
    });
    return;
  }

  // Unexpected server errors.
  console.error("Unexpected Properties Service error:", error);

  res.status(500).json({
    message: "Internal server error",
  });
};