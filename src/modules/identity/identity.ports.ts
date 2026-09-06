import type { Membership, Session, User } from "../../domain/models.js";
import type { Capability, MembershipRole } from "../../domain/roles.js";

export type IdentityProfile = {
  provider: string;
  providerSubject: string;
  email: string;
  displayName: string;
  githubUserId?: string;
};

export interface IdentityProvider {
  authorizationUrl(state: string, redirectUri: string): URL;
  exchangeCode(code: string, redirectUri: string): Promise<IdentityProfile>;
}

export type AuthenticatedActor = {
  user: User;
  session: Session;
  memberships: Membership[];
  capabilities: Capability[];
  roles: MembershipRole[];
};

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  upsertFromIdentity(profile: IdentityProfile): Promise<User>;
}

export interface SessionRepository {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<Session>;
  findActiveByTokenHash(tokenHash: string): Promise<Session | null>;
  revoke(id: string): Promise<void>;
}

export interface MembershipRepository {
  listByUser(userId: string): Promise<Membership[]>;
}
