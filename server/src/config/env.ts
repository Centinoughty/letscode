import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().transform(Number),

  DATABASE_URL: z.url(),
  DATABASE_DIRECT_URL: z.url(),

  SALT_ROUNDS: z.string().transform(Number),

  ACCESS_SECRET: z.string(),
  ACCESS_EXPIRY: z.string(),
  REFRESH_SECRET: z.string(),
  REFRESH_EXPIRY: z.string(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
