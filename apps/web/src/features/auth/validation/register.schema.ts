import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters")
      .max(100, "Full name must not exceed 100 characters"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .max(255, "Email must not exceed 255 characters")
      .transform((email) => email.toLowerCase()),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(72, "Password must not exceed 72 characters"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),

    termsAccepted: z
      .boolean()
      .refine((accepted) => accepted, {
        message: "You must accept the Terms of Service",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;