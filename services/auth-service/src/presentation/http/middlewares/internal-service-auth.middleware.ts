import type {
  Request,
  Response,
  NextFunction,
} from "express";

import crypto from "node:crypto";

export function internalServiceAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const expectedSecret = process.env.INTERNAL_SERVICE_SECRET;
  const receivedSecret = req.headers["x-internal-service-secret"];

  if (
    !expectedSecret ||
    typeof receivedSecret !== "string"
  ) {
    res.status(401).json({
      message: "Unauthorized internal service request",
    });
    return;
  }

  const expected = Buffer.from(expectedSecret);
  const received = Buffer.from(receivedSecret);

  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    res.status(401).json({
      message: "Unauthorized internal service request",
    });
    return;
  }

  next();
}