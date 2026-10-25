
import { Pool } from "pg";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getDatabasePort(): number {
  const value = process.env.DB_PORT ?? "5432";
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("DB_PORT must be a valid TCP port number");
  }

  return port;
}

export const postgresPool = new Pool({
  host: requiredEnv("DB_HOST"),
  port: getDatabasePort(),
  database: requiredEnv("DB_NAME"),
  user: requiredEnv("DB_USER"),
  password: requiredEnv("DB_PASSWORD"),
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});
