import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1),
  FRONTEND_ORIGIN: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  INITIAL_ADMIN_EMAIL: z.string().email().optional(),
  INITIAL_ADMIN_PASSWORD: z.string().min(12).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n")}`);
}

export const env = parsed.data;
