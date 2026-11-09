import { z } from "zod";

export const resetPasswordSchema = z.object({
  resetToken: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, "Invalid password reset authorization"),

  newPassword: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password must not exceed 72 characters"),
});