import { describe, expect, it } from "vitest";

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
});
