import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { APP_ENV } from "../../config/tokens.js";
import type { AppEnv } from "../../config/env.js";
import { ForbiddenError, UnauthorizedError } from "../../common/errors.js";
import type {
  MembershipRepository,
  SessionRepository,
} from "../identity/identity.ports.js";
import { sha256 } from "../../common/crypto.js";

@Injectable()
export class CohortMembershipGuard implements CanActivate {
  constructor(
    @Inject(APP_ENV) private readonly env: AppEnv,
    @Inject("SessionRepository") private readonly session: SessionRepository,
    @Inject("MembershipRepository") private readonly membership: MembershipRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredSlug = request.params.cohortSlug;
    const admin = ["admin", "maintainer"];
    const cookie = request.cookies?.[this.env.SESSION_COOKIE_NAME];
    const session = await this.session.findActiveByTokenHash(sha256(cookie));
    if (!session) {
      throw new UnauthorizedError();
    }
    const roles = await this.membership.findRolesByUserAndCohort(
      session.userId,
      requiredSlug,
    );

    if (roles.length > 0) {
      return true;
    }

    const userRoles = await this.membership.listByUser(session.userId);

    const isAdmin = userRoles.some((membership) =>admin.includes(membership.role));

    if (isAdmin) {
      return true;
    }

    throw new ForbiddenError();
  }
}
