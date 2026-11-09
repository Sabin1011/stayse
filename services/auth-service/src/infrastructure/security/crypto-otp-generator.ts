import { randomInt } from "node:crypto";

import type { OtpGenerator } from "../../application/interfaces/security/otp-generator.interface.js";

export class CryptoOtpGenerator implements OtpGenerator {
  generate(): string {
    return randomInt(0, 1_000_000)
      .toString()
      .padStart(6, "0");
  }
}