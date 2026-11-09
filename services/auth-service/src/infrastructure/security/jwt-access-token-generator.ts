import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import type {
  AccessTokenGenerator,
  AccessTokenPayload,
} from "../../application/interfaces/security/access-token-generator.interface.js";

import { env } from "../../config/env.js";

export class JwtAccessTokenGenerator implements AccessTokenGenerator {
  generate(payload: AccessTokenPayload): string {
    const options: SignOptions = {
      subject: payload.userId,
      expiresIn: "15m",
      issuer: "stayse-auth-service",
      audience: "stayse-api",
    };

    return jwt.sign(
      {
        email: payload.email,
      },
      env.JWT_ACCESS_SECRET,
      options,
    );
  }
}