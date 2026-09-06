import { Injectable } from "@nestjs/common";

import type { Assignment, Engagement, Product } from "../../domain/models.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      include: { repository: true },
      orderBy: { name: "asc" },
    });

    return records.map((record) => ({
      id: record.id,
      slug: record.slug,
      name: record.name,
      status: record.status,
      repository: record.repository
        ? {
            githubOwner: record.repository.githubOwner,
            githubRepo: record.repository.githubRepo,
          }
        : null,
    }));
  }

  async listEngagements(): Promise<Engagement[]> {
    const records = await this.prisma.cohortProductEngagement.findMany({
      include: {
        cohort: true,
        product: { include: { repository: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => ({
      id: record.id,
      status: record.status,
      cohort: {
        id: record.cohort.id,
        slug: record.cohort.slug,
        name: record.cohort.name,
        startsOn: record.cohort.startsOn.toISOString().slice(0, 10),
        endsOn: record.cohort.endsOn.toISOString().slice(0, 10),
      },
      product: {
        id: record.product.id,
        slug: record.product.slug,
        name: record.product.name,
        status: record.product.status,
        repository: record.product.repository
          ? {
              githubOwner: record.product.repository.githubOwner,
              githubRepo: record.product.repository.githubRepo,
            }
          : null,
      },
    }));
  }

  async listAssignments(): Promise<Assignment[]> {
    const records = await this.prisma.assignment.findMany({
      orderBy: [{ engagementId: "asc" }, { weekNumber: "asc" }],
    });

    return records.map((record) => ({
      id: record.id,
      weekNumber: record.weekNumber,
      title: record.title,
      status: record.status,
      engagementId: record.engagementId,
    }));
  }
}
