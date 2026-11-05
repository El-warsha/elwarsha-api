import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { ForbiddenError, UnauthorizedError } from "../../common/errors.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { AuthenticatedActor } from "../identity/identity.ports.js";

@Injectable()
export class CohortMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { actor?: AuthenticatedActor }>();
    const actor = request.actor;

    if (!actor) {
      throw new UnauthorizedError();
    }

    // Admins and maintainers have platform-wide access to all cohorts
    if (actor.roles.includes("admin") || actor.roles.includes("maintainer")) {
      return true;
    }

    const cohortSlug = request.params.cohortSlug;
    if (!cohortSlug || typeof cohortSlug !== "string") {
      return true;
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: actor.user.id,
        engagement: {
          cohort: {
            slug: cohortSlug,
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenError(`You do not have access to cohort "${cohortSlug}"`);
    }

    return true;
  }
}
