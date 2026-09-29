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

  loginUrl(state: string, redirectUri: string): URL {
    return this.identity.authorizationUrl(state, redirectUri);
  }

  async completeLogin(
    code: string,
    redirectUri: string,
  ): Promise<{ token: string; user: User }> {
    const profile = await this.identity.exchangeCode(code, redirectUri);
    const user = await this.users.upsertFromIdentity(profile);
    const token = await this.sessions.issue(user.id);
    return { token, user };
  }

  callbackRedirect(tokenIssued: boolean, locale: "ar" | "en" = "ar"): string {
    const url = new URL(`/${locale}/portal/`, this.env.WEB_ORIGIN);
    if (!tokenIssued) {
      url.searchParams.set("auth", "failed");
    }
    return url.toString();
  }
}
