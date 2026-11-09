import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import type { OtpHasher } from "../../application/interfaces/security/otp-hasher.interface.js";

export class HmacOtpHasher implements OtpHasher {
  private readonly secret: string;

  constructor() {
    const secret = process.env.OTP_HASH_SECRET;

    if (!secret || !/^[a-fA-F0-9]{64}$/.test(secret)) {
      throw new Error(
        "OTP_HASH_SECRET must be a 64-character hexadecimal secret",
      );
    }

    this.secret = secret;
  }

  hash(otp: string): string {
    this.validateOtp(otp);

    return createHmac("sha256", Buffer.from(this.secret, "hex"))
      .update(otp)
      .digest("hex");
  }

  verify(otp: string, hashedOtp: string): boolean {
    if (!/^\d{6}$/.test(otp) || !/^[a-fA-F0-9]{64}$/.test(hashedOtp)) {
      return false;
    }

    const calculatedHash = Buffer.from(this.hash(otp), "hex");
    const storedHash = Buffer.from(hashedOtp, "hex");

    return timingSafeEqual(calculatedHash, storedHash);
  }

  private validateOtp(otp: string): void {
    if (!/^\d{6}$/.test(otp)) {
      throw new Error("OTP must contain exactly six digits");
    }
  }
}