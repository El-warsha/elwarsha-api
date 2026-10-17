import { Injectable } from "@nestjs/common";
import { ConflictError } from "../../common/errors.js";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";

export interface CohortApplicationRecord extends ApplyCohortDto {
  id: string;
  cohortSlug: string;
  status: "received" | "in_review" | "accepted";
  createdAt: string;
}

@Injectable()
export class ApplicationsService {
  private readonly applications: CohortApplicationRecord[] = [];

  async apply(
    cohortSlug: string,
    dto: ApplyCohortDto,
  ): Promise<{
    id: string;
    cohortSlug: string;
    email: string;
    status: string;
    createdAt: string;
  }> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const normalizedGithub = dto.githubHandle.toLowerCase().trim();

    const existing = this.applications.find(
      (app) =>
        app.cohortSlug === cohortSlug &&
        (app.email.toLowerCase().trim() === normalizedEmail ||
          app.githubHandle.toLowerCase().trim() === normalizedGithub),
    );

    if (existing) {
      throw new ConflictError(
        `An application with this email or GitHub handle already exists for ${cohortSlug}`,
      );
    }

    const record: CohortApplicationRecord = {
      ...dto,
      id: `app_${crypto.randomUUID().slice(0, 8)}`,
      cohortSlug,
      email: normalizedEmail,
      githubHandle: normalizedGithub,
      status: "received",
      createdAt: new Date().toISOString(),
    };

    this.applications.push(record);

    return {
      id: record.id,
      cohortSlug: record.cohortSlug,
      email: record.email,
      status: record.status,
      createdAt: record.createdAt,
    };
  }

  async findByCohort(cohortSlug: string): Promise<CohortApplicationRecord[]> {
    return this.applications.filter((app) => app.cohortSlug === cohortSlug);
  }

  reset(): void {
    this.applications.length = 0;
  }
}
