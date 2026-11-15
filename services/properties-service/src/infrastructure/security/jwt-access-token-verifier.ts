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
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string" ||
      !Array.isArray(decoded.roles) ||
      !decoded.roles.every((role) => typeof role === "string")
    ) {
      throw new Error("Invalid access token payload");
    }

    return {
      userId: decoded.sub,
      email: decoded.email,
      roles: decoded.roles,
    };
  }
}