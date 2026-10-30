import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class CohortMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const actor = request.actor || request.user;

    if (!actor) {
      throw new UnauthorizedException("Authentication required");
    }

    if (actor.role === "admin" || actor.role === "maintainer") {
      return true;
    }

    const cohortSlug = request.params.cohortSlug;
    if (!cohortSlug) {
      return true;
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: actor.id,
        engagement: {
          cohort: {
            slug: cohortSlug,
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You are not enrolled in this cohort (BOLA Defense)");
    }

    return true;
  }
}
