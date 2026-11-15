import { describe, expect, it } from "vitest";

import type { AppEnv } from "../../config/env.js";
import { FakeIdentityProvider } from "./fake-identity.provider.js";

describe("FakeIdentityProvider", () => {
  it("returns a callback URL that the API can complete", () => {
    const provider = new FakeIdentityProvider();
    const url = provider.authorizationUrl(
      "elwarsha",
      "http://localhost:3001/api/v1/auth/callback",
    );
    expect(url.searchParams.get("code")).toBe("fake-code");
  });

  it("exchanges code and returns default githubUserId 1001", async () => {
    const provider = new FakeIdentityProvider();
    const profile = await provider.exchangeCode();
    expect(profile.githubUserId).toBe("1001");
  });

  it("exchanges code and uses FAKE_USER_GITHUB_ID when configured", async () => {
    const provider = new FakeIdentityProvider({
      FAKE_USER_GITHUB_ID: "90442975",
    } as AppEnv);
    const profile = await provider.exchangeCode();
    expect(profile.githubUserId).toBe("90442975");
  });
});
