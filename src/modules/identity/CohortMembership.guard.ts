import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { ForbiddenError } from "../../common/errors.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class CohortMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { actor?: any }>();

    const actor = request.actor;

    const cohortSlug = request.params?.cohortSlug as string | undefined;

    if (!actor || !cohortSlug) {
      throw new ForbiddenError();
    }

    if (actor.roles?.includes("admin") || actor.roles?.includes("maintainer")) {
      return true;
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        user: {
          id: actor.user.id,
        },
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
