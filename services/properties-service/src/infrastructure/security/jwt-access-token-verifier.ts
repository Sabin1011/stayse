import jwt from "jsonwebtoken";

import type {
  AccessTokenVerifier,
  VerifiedAccessToken,
} from "../../application/interfaces/security/access-token-verifier.interface.js";

export class JwtAccessTokenVerifier implements AccessTokenVerifier {
  constructor(private readonly jwtSecret: string) {}

  verify(token: string): VerifiedAccessToken {
    const decoded = jwt.verify(token, this.jwtSecret, {
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