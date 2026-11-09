import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(64),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

  OTP_HASH_SECRET: z.string().min(64),

  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.coerce.number(),
  MAIL_USER: z.string().min(1),
  MAIL_PASSWORD: z.string().min(1),
  MAIL_FROM: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsedEnv.data;