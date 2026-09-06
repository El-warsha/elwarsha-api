import { Inject, Injectable } from "@nestjs/common";

import { UnauthorizedError } from "../../common/errors.js";
import { randomToken, sha256 } from "../../common/crypto.js";
import type { AppEnv } from "../../config/env.js";
import { APP_ENV } from "../../config/tokens.js";
import { capabilitiesForRoles } from "../../domain/roles.js";
import type {
  AuthenticatedActor,
  SessionRepository,
  UserRepository,
} from "./identity.ports.js";
import type { MembershipRepository } from "./identity.ports.js";

@Injectable()
export class SessionService {
  constructor(
    @Inject(APP_ENV) private readonly env: AppEnv,
    @Inject("UserRepository") private readonly users: UserRepository,
    @Inject("SessionRepository") private readonly sessions: SessionRepository,
    @Inject("MembershipRepository") private readonly memberships: MembershipRepository,
  ) {}

  async issue(userId: string): Promise<string> {
    const token = randomToken();
    const expiresAt = new Date(Date.now() + this.env.SESSION_TTL_SECONDS * 1000);
    await this.sessions.create(userId, sha256(token), expiresAt);
    return token;
  }

  async resolve(token: string | undefined): Promise<AuthenticatedActor> {
    if (!token) {
      throw new UnauthorizedError();
    }

    const session = await this.sessions.findActiveByTokenHash(sha256(token));
    if (!session) {
      throw new UnauthorizedError();
    }

    const user = await this.users.findById(session.userId);
    if (!user) {
      throw new UnauthorizedError();
    }

    const memberships = await this.memberships.listByUser(user.id);
    const roles = memberships.map((membership) => membership.role);
    return {
      user,
      session,
      memberships,
      roles,
      capabilities: capabilitiesForRoles(roles),
    };
  }

  async revoke(sessionId: string): Promise<void> {
    await this.sessions.revoke(sessionId);
  }
}
