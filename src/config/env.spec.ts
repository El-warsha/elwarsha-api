import { describe, expect, it } from "vitest";

import { loadEnv } from "./env.js";

const valid = {
  DATABASE_URL: "postgresql://elwarsha:elwarsha@localhost:5432/elwarsha",
  WEB_ORIGIN: "http://localhost:5173",
  SESSION_SECRET: "replace-with-32-byte-secret",
  GITHUB_WEBHOOK_SECRET: "replace-webhook-secret",
};

describe("loadEnv", () => {
  it("loads a development configuration", () => {
    const env = loadEnv(valid);
    expect(env.PORT).toBe(3001);
    expect(env.IDENTITY_PROVIDER).toBe("fake");
  });

  it("rejects missing required fields", () => {
    expect(() => loadEnv({})).toThrow(/Invalid environment:/);
  });

  it("rejects Auth0 mode without tenant credentials", () => {
    expect(() =>
      loadEnv({
        ...valid,
        IDENTITY_PROVIDER: "auth0",
      }),
    ).toThrow(/Auth0 identity requires/);
  });

  it("requires a configured API origin in production", () => {
    expect(() => loadEnv({ ...valid, NODE_ENV: "production" })).toThrow(
      /Production requires API_ORIGIN/,
    );
  });
});
