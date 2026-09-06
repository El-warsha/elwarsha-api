import { Injectable } from "@nestjs/common";

import type { Membership, Session, User } from "../../domain/models.js";
import type { MembershipRole } from "../../domain/roles.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type {
  IdentityProfile,
  MembershipRepository,
  SessionRepository,
  UserRepository,
} from "./identity.ports.js";

function toUser(record: {
  id: string;
  displayName: string;
  email: string;
  locale: "ar" | "en";
}): User {
  return {
    id: record.id,
    displayName: record.displayName,
    email: record.email,
    locale: record.locale,
  };
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? toUser(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? toUser(record) : null;
  }

  async upsertFromIdentity(profile: IdentityProfile): Promise<User> {
    const existingIdentity = await this.prisma.externalIdentity.findUnique({
      where: {
        provider_providerSubject: {
          provider: profile.provider,
          providerSubject: profile.providerSubject,
        },
      },
      include: { user: true },
    });

    if (existingIdentity) {
      return toUser(existingIdentity.user);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      await this.prisma.externalIdentity.create({
        data: {
          userId: existingUser.id,
          provider: profile.provider,
          providerSubject: profile.providerSubject,
          githubUserId: profile.githubUserId ? BigInt(profile.githubUserId) : null,
        },
      });
      return toUser(existingUser);
    }

    const created = await this.prisma.user.create({
      data: {
        displayName: profile.displayName,
        email: profile.email,
        identities: {
          create: {
            provider: profile.provider,
            providerSubject: profile.providerSubject,
            githubUserId: profile.githubUserId ? BigInt(profile.githubUserId) : null,
          },
        },
      },
    });

    return toUser(created);
  }
}

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<Session> {
    return this.prisma.session.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async findActiveByTokenHash(tokenHash: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({ where: { tokenHash } });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return null;
    }
    return session;
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}

@Injectable()
export class PrismaMembershipRepository implements MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(userId: string): Promise<Membership[]> {
    const records = await this.prisma.membership.findMany({ where: { userId } });
    return records.map((record) => ({
      id: record.id,
      userId: record.userId,
      engagementId: record.engagementId,
      role: record.role as MembershipRole,
    }));
  }
}
