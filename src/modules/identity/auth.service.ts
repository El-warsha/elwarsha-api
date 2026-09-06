import { Inject, Injectable } from "@nestjs/common";

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

  loginUrl(state: string, redirectUri: string): URL {
    return this.identity.authorizationUrl(state, redirectUri);
  }

  async completeLogin(code: string, redirectUri: string): Promise<string> {
    const profile = await this.identity.exchangeCode(code, redirectUri);
    const user = await this.users.upsertFromIdentity(profile);
    return this.sessions.issue(user.id);
  }

  callbackRedirect(tokenIssued: boolean): string {
    const url = new URL("/ar/portal/", this.env.WEB_ORIGIN);
    if (!tokenIssued) {
      url.searchParams.set("auth", "failed");
    }
    return url.toString();
  }
}
