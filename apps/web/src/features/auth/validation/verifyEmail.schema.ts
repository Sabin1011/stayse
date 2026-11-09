import { z } from "zod";

export const verifyEmailSchema = z.object({
  otp: z
    .string()
    .regex(/^\d{6}$/, "OTP must contain exactly 6 digits"),
});

export type VerifyEmailFormValues = z.infer<
  typeof verifyEmailSchema
>;