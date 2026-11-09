import jwt from "jsonwebtoken";

import type {
  AccessTokenVerifier,
  VerifiedAccessToken,
} from "../../application/interfaces/security/access-token-verifier.interface.js";

import { env } from "../../config/env.js";

export class JwtAccessTokenVerifier implements AccessTokenVerifier {
  verify(token: string): VerifiedAccessToken {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
      issuer: "stayse-auth-service",
      audience: "stayse-api",
    });

    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string"
    ) {
      throw new Error("Invalid access token payload");
    }

    return {
      userId: decoded.sub,
      email: decoded.email,
    };
  }
}