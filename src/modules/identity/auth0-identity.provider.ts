import type { AppEnv } from "../../config/env.js";
import type { IdentityProfile, IdentityProvider } from "./identity.ports.js";

export class Auth0IdentityProvider implements IdentityProvider {
  constructor(private readonly env: AppEnv) {}

  authorizationUrl(state: string, redirectUri: string): URL {
    const url = new URL(`https://${this.env.AUTH0_DOMAIN}/authorize`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", this.env.AUTH0_CLIENT_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", "openid profile email");
    url.searchParams.set("state", state);
    if (this.env.AUTH0_AUDIENCE) {
      url.searchParams.set("audience", this.env.AUTH0_AUDIENCE);
    }
    return url;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<IdentityProfile> {
    const tokenResponse = await fetch(`https://${this.env.AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: this.env.AUTH0_CLIENT_ID,
        client_secret: this.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Auth0 token exchange failed");
    }

    const tokens = (await tokenResponse.json()) as { access_token: string };
    const userResponse = await fetch(`https://${this.env.AUTH0_DOMAIN}/userinfo`, {
      headers: { authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error("Auth0 userinfo request failed");
    }

    const profile = (await userResponse.json()) as {
      sub: string;
      email?: string;
      name?: string;
    };

    return {
      provider: "auth0",
      providerSubject: profile.sub,
      email: profile.email ?? `${profile.sub}@users.elwarsha.dev`,
      displayName: profile.name ?? profile.email ?? "ElWarsha participant",
    };
  }
}
