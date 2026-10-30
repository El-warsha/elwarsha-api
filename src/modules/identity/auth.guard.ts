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
  //read settings from the environment and inject the session service to resolve user identity and capabilities
  constructor(
    @Inject(APP_ENV) private readonly env: AppEnv,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // extract the request object from the execution context
    const request = context.switchToHttp().getRequest<Request & { actor?: unknown }>();
    // extract the session token from the request cookies
    const token = request.cookies?.[this.env.SESSION_COOKIE_NAME] as string | undefined;
    // user identity is resolved and attached to the request object for further use in the request lifecycle
    const actor = await this.sessions.resolve(token);
    // add the actor to the request object so that it can be accessed in the controller or other parts of the request lifecycle
    request.actor = actor;

    const required = Reflect.getMetadata(CAPABILITY_KEY, context.getHandler()) as
      Capability | undefined;
    // if user does not have access to the required capability, throw a forbidden error
    if (required && !hasCapability(actor.capabilities, required)) {
      throw new ForbiddenError();
    }

    return true;
  }
}
