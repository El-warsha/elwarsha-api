import type { AppEnv } from "../../config/env.js";
import type { IdentityProfile, IdentityProvider } from "./identity.ports.js";

export class FakeIdentityProvider implements IdentityProvider {
  constructor(private readonly env?: AppEnv) {}

  authorizationUrl(state: string, redirectUri: string): URL {
    const url = new URL(redirectUri);
    url.searchParams.set("code", "fake-code");
    url.searchParams.set("state", state);
    return url;
  }

  async exchangeCode(): Promise<IdentityProfile> {
    return {
      provider: "fake",
      providerSubject: "fake-user-1",
      email: "participant@elwarsha.dev",
      displayName: "Test Participant",
      githubUserId: this.env?.FAKE_USER_GITHUB_ID || "1001",
    };
  }
}
