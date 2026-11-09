import { z } from "zod";

export const verifyPasswordResetOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(255)
    .transform((email) => email.toLowerCase()),

  otp: z
    .string()
    .regex(/^\d{6}$/, "OTP must contain exactly 6 digits"),
});