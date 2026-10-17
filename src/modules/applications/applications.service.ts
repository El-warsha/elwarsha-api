import { ConflictException, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { CreateApplicationDto } from "./dto/apply-cohort.dto.js";

export interface StoredApplication {
  id: string;
  cohortSlug: string;
  email: string;
  githubHandle: string;
  status: string;
  createdAt: string;
  data: CreateApplicationDto;
}

export interface ApplicationReceipt {
  id: string;
  cohortSlug: string;
  email: string;
  status: string;
  createdAt: string;
}

@Injectable()
export class ApplicationsService {
  private readonly applications: StoredApplication[] = [];

  createApplication(cohortSlug: string, dto: CreateApplicationDto): ApplicationReceipt {
    const normalizedCohort = cohortSlug.toLowerCase().trim();
    const normalizedEmail = dto.email.toLowerCase().trim();
    const normalizedGithub = dto.githubHandle.toLowerCase().trim();

    const isDuplicate = this.applications.some(
      (app) =>
        app.cohortSlug.toLowerCase() === normalizedCohort &&
        (app.email.toLowerCase() === normalizedEmail ||
          app.githubHandle.toLowerCase() === normalizedGithub),
    );

    if (isDuplicate) {
      const cohortName = cohortSlug === "cohort-2" ? "Cohort 2" : cohortSlug;
      throw new ConflictException(
        `An application with this email or GitHub handle already exists for ${cohortName}`,
      );
    }

    const applicationRecord: StoredApplication = {
      id: `app_${randomUUID().replace(/-/g, "").slice(0, 10)}`,
      cohortSlug,
      email: normalizedEmail,
      githubHandle: normalizedGithub,
      status: "received",
      createdAt: new Date().toISOString(),
      data: { ...dto },
    };

    this.applications.push(applicationRecord);

    return {
      id: applicationRecord.id,
      cohortSlug: applicationRecord.cohortSlug,
      email: applicationRecord.email,
      status: applicationRecord.status,
      createdAt: applicationRecord.createdAt,
    };
  }
}
