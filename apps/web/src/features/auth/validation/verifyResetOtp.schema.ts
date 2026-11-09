import { z } from "zod";

export const verifyResetOtpSchema = z.object({
  otp: z
    .string()
    .regex(/^\d{6}$/, "Enter the complete six-digit OTP"),
});

export type VerifyResetOtpFormValues = z.infer<
  typeof verifyResetOtpSchema
>;