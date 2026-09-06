import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z.string().min(1),
  WEB_ORIGIN: z.string().url(),
  API_ORIGIN: z.string().url().optional(),
  SESSION_COOKIE_NAME: z.string().min(1).default("elwarsha_session"),
  SESSION_SECRET: z.string().min(16),
  SESSION_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 14),
  IDENTITY_PROVIDER: z.enum(["auth0", "fake"]).default("fake"),
  AUTH0_DOMAIN: z.string().optional().default(""),
  AUTH0_CLIENT_ID: z.string().optional().default(""),
  AUTH0_CLIENT_SECRET: z.string().optional().default(""),
  AUTH0_AUDIENCE: z.string().optional().default(""),
  GITHUB_APP_ID: z.string().optional().default(""),
  GITHUB_APP_PRIVATE_KEY: z.string().optional().default(""),
  GITHUB_WEBHOOK_SECRET: z.string().min(8),
  GITHUB_APP_CLIENT_ID: z.string().optional().default(""),
  GITHUB_APP_CLIENT_SECRET: z.string().optional().default(""),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${details}`);
  }

  if (parsed.data.IDENTITY_PROVIDER === "auth0") {
    const missing = ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET"].filter(
      (key) => !parsed.data[key as keyof AppEnv],
    );
    if (missing.length > 0) {
      throw new Error(`Auth0 identity requires ${missing.join(", ")}`);
    }
  }

  if (parsed.data.NODE_ENV === "production" && !parsed.data.API_ORIGIN) {
    throw new Error("Production requires API_ORIGIN");
  }

  return parsed.data;
}
