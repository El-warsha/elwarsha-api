import {
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { CookieOptions, Request, Response } from "express";

import { randomToken, safeEqual } from "../../common/crypto.js";
import type { AppEnv } from "../../config/env.js";
import { APP_ENV } from "../../config/tokens.js";
import type { AuthenticatedActor } from "./identity.ports.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { SessionService } from "./session.service.js";

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

@ApiTags("auth")
@Controller("api/v1/auth")
export class AuthController {
  constructor(
    @Inject(APP_ENV) private readonly env: AppEnv,
    private readonly auth: AuthService,
    private readonly sessions: SessionService,
  ) {}

  @Get("login")
  login(@Res() response: Response): void {
    const state = randomToken();
    const redirectUri = this.callbackUrl(response);
    response.cookie(this.oauthStateCookieName(), state, {
      ...this.cookieOptions("/api/v1/auth/callback"),
      maxAge: OAUTH_STATE_TTL_MS,
    });
    const url = this.auth.loginUrl(state, redirectUri);
    response.redirect(url.toString());
  }

  @Get("callback")
  async callback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const expectedState = request.cookies?.[this.oauthStateCookieName()] as
      string | undefined;
    response.clearCookie(
      this.oauthStateCookieName(),
      this.cookieOptions("/api/v1/auth/callback"),
    );

    if (!code || !state || !expectedState || !safeEqual(state, expectedState)) {
      response.redirect(this.auth.callbackRedirect(false));
      return;
    }

    try {
      const token = await this.auth.completeLogin(code, this.callbackUrl(response));
      response.cookie(this.env.SESSION_COOKIE_NAME, token, {
        ...this.cookieOptions("/"),
        maxAge: this.env.SESSION_TTL_SECONDS * 1000,
      });
      response.redirect(this.auth.callbackRedirect(true));
    } catch {
      response.redirect(this.auth.callbackRedirect(false));
    }
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() request: Request & { actor: AuthenticatedActor }) {
    return {
      user: request.actor.user,
      roles: request.actor.roles,
      capabilities: request.actor.capabilities,
      memberships: request.actor.memberships,
    };
  }

  @Post("logout")
  @UseGuards(AuthGuard)
  async logout(
    @Req() request: Request & { actor: AuthenticatedActor },
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.sessions.revoke(request.actor.session.id);
    response.clearCookie(this.env.SESSION_COOKIE_NAME, this.cookieOptions("/"));
    return { ok: true };
  }

  private callbackUrl(response: Response): string {
    return `${this.env.API_ORIGIN ?? this.requestOrigin(response)}/api/v1/auth/callback`;
  }

  private cookieOptions(path: string): CookieOptions {
    return {
      httpOnly: true,
      secure: this.env.NODE_ENV === "production",
      sameSite: "lax",
      path,
    };
  }

  private oauthStateCookieName(): string {
    return `${this.env.SESSION_COOKIE_NAME}_oauth_state`;
  }

  private requestOrigin(response: Response): string {
    const request = response.req;
    const protocol = request.protocol;
    return `${protocol}://${request.get("host")}`;
  }
}
