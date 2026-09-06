import { CanActivate, ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import type { Request } from "express";

import { ForbiddenError } from "../../common/errors.js";
import type { Capability } from "../../domain/roles.js";
import { hasCapability } from "../../domain/roles.js";
import type { AppEnv } from "../../config/env.js";
import { APP_ENV } from "../../config/tokens.js";
import { SessionService } from "./session.service.js";
import { Inject } from "@nestjs/common";

export const CAPABILITY_KEY = "requiredCapability";
export const RequireCapability = (capability: Capability) =>
  SetMetadata(CAPABILITY_KEY, capability);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(APP_ENV) private readonly env: AppEnv,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { actor?: unknown }>();
    const token = request.cookies?.[this.env.SESSION_COOKIE_NAME] as string | undefined;
    const actor = await this.sessions.resolve(token);
    request.actor = actor;

    const required = Reflect.getMetadata(CAPABILITY_KEY, context.getHandler()) as
      Capability | undefined;
    if (required && !hasCapability(actor.capabilities, required)) {
      throw new ForbiddenError();
    }

    return true;
  }
}
