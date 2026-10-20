import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";


@Injectable()
export class WeeksRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findActiveEngagement() {
    return this.prisma.cohortProductEngagement.findFirst({
      where: { status: "active" },
      include: { cohort: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findLatestCohort() {
    return this.prisma.cohort.findFirst({
      orderBy: { startsOn: "desc" },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.cohort.findUnique({
      where: { slug },
      include: {
        engagements: {
          include: {
            assignments: {
              include: {
                labels: {
                  include: {
                    label: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findBySlugAndWeek(slug: string, weekNumber: number) {
  return this.prisma.cohort.findUnique({
    where: { slug },
    include: {
      engagements: {
        include: {
          assignments: {
            where: { weekNumber },
            include: {
              labels: {
                include: {
                  label: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

}