import { z } from "zod";

export const requestPasswordResetOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(255)
    .transform((email) => email.toLowerCase()),
});