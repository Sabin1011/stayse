import {
  createHash,
  randomBytes,
} from "node:crypto";

import type { PasswordResetTokenGenerator } from "../../application/interfaces/security/password-reset-token-generator.interface.js";

export class CryptoPasswordResetTokenGenerator
  implements PasswordResetTokenGenerator
{
  generate(): string {
    return randomBytes(32).toString("hex");
  }

  hash(token: string): string {
    return createHash("sha256")
      .update(token)
      .digest("hex");
  }
}