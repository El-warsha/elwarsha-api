import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class CohortMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const cohortSlug = request.params.cohortSlug;

    if (!user) {
      return false;
    }

    if (user.role === "ADMIN" || user.role === "MAINTAINER") {
      return true;
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        cohort: { slug: cohortSlug },
        userId: user.id,
      },
    });

    if (!membership) {
      throw new ForbiddenException("You are not enrolled in this cohort");
    }

    return true;
  }
}
