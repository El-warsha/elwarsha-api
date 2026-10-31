import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { ForbiddenError, NotFoundError } from "../../common/errors.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { AuthenticatedActor } from "./identity.ports.js";

@Injectable()
export class CohortMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { actor?: AuthenticatedActor }>();

    const actor = request.actor;
    if (!actor) {
      // AuthGuard should have populated this. If it didn't, deny.
      throw new ForbiddenError();
    }

    // Admins & maintainers bypass the cohort membership check.
    const isPrivileged =
      actor.roles.includes("admin") || actor.roles.includes("maintainer");
    if (isPrivileged) {
      return true;
    }

    // `request.params` values are `string | string[]` in Express types.
    // Cohort slugs are single-segment params, so narrow to string.
    const rawSlug = request.params.cohortSlug;
    const cohortSlug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

    if (!cohortSlug) {
      // Not a cohort-scoped route — allow.
      return true;
    }

    const cohort = await this.prisma.cohort.findUnique({
      where: { slug: cohortSlug },
      select: { id: true },
    });

    if (!cohort) {
      throw new NotFoundError(`Cohort "${cohortSlug}" not found`);
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: actor.user.id,
        engagement: {
          cohortId: cohort.id,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      throw new ForbiddenError("You are not enrolled in this cohort");
    }

    return true;
  }
}
