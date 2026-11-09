
import { z } from "zod";

export const resendEmailVerificationOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(255)
    .transform((value) => value.toLowerCase()),
});
