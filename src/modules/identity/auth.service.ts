import { Inject, Injectable } from "@nestjs/common";

import type { User } from "../../domain/models.js";
import type { AppEnv } from "../../config/env.js";
import type { IdentityProvider, UserRepository } from "./identity.ports.js";
import { APP_ENV } from "../../config/tokens.js";
import { SessionService } from "./session.service.js";

@Injectable()
export class AuthService {
  constructor(
    @Inject(APP_ENV) private readonly env: AppEnv,
    @Inject("IdentityProvider") private readonly identity: IdentityProvider,
    @Inject("UserRepository") private readonly users: UserRepository,
    private readonly sessions: SessionService,
  ) {}
  // generates the login URL  to start login
  loginUrl(state: string, redirectUri: string): URL {
    return this.identity.authorizationUrl(state, redirectUri);
  }

  async completeLogin(
    code: string,
    redirectUri: string,
  ): Promise<{ token: string; user: User }> {
    // get the user profile from the identity provider using the authorization code and redirect URI
    const profile = await this.identity.exchangeCode(code, redirectUri);
    // add user to the database if not exists, or update the user if exists
    const user = await this.users.upsertFromIdentity(profile);
    // issue a session token for the user
    const token = await this.sessions.issue(user.id);
    // return the session token and user information
    return { token, user };
  }
  //url to portal after login, if login failed, add query param to indicate failure
  callbackRedirect(tokenIssued: boolean, locale: "ar" | "en" = "ar"): string {
    const url = new URL(`/${locale}/portal/`, this.env.WEB_ORIGIN);
    if (!tokenIssued) {
      url.searchParams.set("auth", "failed");
    }
    return url.toString();
  }
}
