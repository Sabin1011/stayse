import { createHash, randomBytes } from "node:crypto";

import type { RefreshTokenGenerator } from "../../application/interfaces/security/refresh-token-generator.interface.js";

export class CryptoRefreshTokenGenerator
  implements RefreshTokenGenerator
{
  generate(): string {
    return randomBytes(32).toString("base64url");
  }

  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}