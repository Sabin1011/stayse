import { z } from "zod";

export const verifyEmailOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  otp: z.string().regex(/^\d{6}$/, "OTP must contain exactly 6 digits"),
});