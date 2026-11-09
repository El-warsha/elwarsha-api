import { Injectable } from "@nestjs/common";

import type { Engagement, Product } from "../../domain/models.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      include: { repositories: true },
      orderBy: { name: "asc" },
    });

    return records.map((record) => {
      const repos = record.repositories.map((r) => ({
        id: r.id,
        githubOwner: r.githubOwner,
        githubRepo: r.githubRepo,
      }));
      return {
        id: record.id,
        slug: record.slug,
        name: record.name,
        status: record.status,
        repositories: repos,
        repository: repos[0] ?? null,
      };
    });
  }

  async listEngagements(): Promise<Engagement[]> {
    const records = await this.prisma.cohortProductEngagement.findMany({
      include: {
        cohort: true,
        product: { include: { repositories: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => {
      const repos = record.product.repositories.map((r) => ({
        id: r.id,
        githubOwner: r.githubOwner,
        githubRepo: r.githubRepo,
      }));
      return {
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
          repositories: repos,
          repository: repos[0] ?? null,
        },
      };
    });
  }
}
