import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { ForbiddenError } from "../../common/errors.js";
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
    const cohortSlug = request.params.cohortSlug;

    if (!actor || !cohortSlug || Array.isArray(cohortSlug)) {
      throw new ForbiddenError();
    }

    // Admins and maintainers can access all cohorts.
    if (actor.roles.includes("admin") || actor.roles.includes("maintainer")) {
      return true;
    }

    // Check whether the authenticated user is a member of this cohort.
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
      throw new ForbiddenError();
    }

    return true;
  }
}
