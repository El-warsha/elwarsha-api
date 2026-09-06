import type { IdentityProfile, IdentityProvider } from "./identity.ports.js";

export class FakeIdentityProvider implements IdentityProvider {
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
      displayName: "Mariam Participant",
      githubUserId: "1001",
    };
  }
}
