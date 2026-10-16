import { Injectable } from "@nestjs/common";

import type { CohortApplication } from "../../domain/models.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { ApplyCohortDto } from "./dto/apply-cohort.dto.js";

type CohortApplicationRecord = {
  id: string;
  cohortSlug: string;
  status: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  githubHandle: string;
  discordHandle: string;
  currentStatus: string;
  collegeMajor: string;
  programmingExperience: string;
  technologies: string;
  gitExperience: string;
  personalPageUrl: string;
  githubRepoUrl: string;
  aiUsage: string;
  motivation: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(cohortSlug: string, dto: ApplyCohortDto): Promise<CohortApplication> {
    const record = await this.prisma.cohortApplication.create({
      data: {
        cohortSlug,
        fullName: dto.fullName,
        email: dto.email,
        whatsappNumber: dto.whatsappNumber,
        githubHandle: dto.githubHandle,
        discordHandle: dto.discordHandle,
        currentStatus: dto.currentStatus,
        collegeMajor: dto.collegeMajor,
        programmingExperience: dto.programmingExperience,
        technologies: dto.technologies,
        gitExperience: dto.gitExperience,
        personalPageUrl: dto.personalPageUrl,
        githubRepoUrl: dto.githubRepoUrl,
        aiUsage: dto.aiUsage,
        motivation: dto.motivation,
      },
    });

    return this.toDomain(record);
  }

  async findByEmailOrGithub(
    cohortSlug: string,
    email: string,
    githubHandle: string,
  ): Promise<CohortApplication | null> {
    const record = await this.prisma.cohortApplication.findFirst({
      where: {
        cohortSlug,
        OR: [{ email }, { githubHandle }],
      },
    });

    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<CohortApplication | null> {
    const record = await this.prisma.cohortApplication.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  private toDomain(record: CohortApplicationRecord): CohortApplication {
    return {
      id: record.id,
      cohortSlug: record.cohortSlug,
      status: record.status as CohortApplication["status"],
      fullName: record.fullName,
      email: record.email,
      whatsappNumber: record.whatsappNumber,
      githubHandle: record.githubHandle,
      discordHandle: record.discordHandle,
      currentStatus: record.currentStatus,
      collegeMajor: record.collegeMajor,
      programmingExperience: record.programmingExperience,
      technologies: record.technologies,
      gitExperience: record.gitExperience,
      personalPageUrl: record.personalPageUrl,
      githubRepoUrl: record.githubRepoUrl,
      aiUsage: record.aiUsage,
      motivation: record.motivation,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
