import { Injectable } from "@nestjs/common";

import { DuplicateApplicationError, NotFoundError } from "../../common/errors.js";
import type { CohortApplication, CohortApplicationReceipt } from "../../domain/models.js";
import { ApplicationsRepository } from "./applications.repository.js";
import type { ApplyCohortDto } from "./dto/apply-cohort.dto.js";

@Injectable()
export class ApplicationsService {
  constructor(private readonly applications: ApplicationsRepository) {}

  async apply(
    cohortSlug: string,
    dto: ApplyCohortDto,
  ): Promise<CohortApplicationReceipt> {
    const duplicate = await this.applications.findByEmailOrGithub(
      cohortSlug,
      dto.email,
      dto.githubHandle,
    );

    if (duplicate) {
      throw new DuplicateApplicationError(cohortSlug);
    }

    const application = await this.applications.create(cohortSlug, dto);

    return {
      id: application.id,
      cohortSlug: application.cohortSlug,
      email: application.email,
      status: application.status,
      createdAt: application.createdAt,
    };
  }

  async getById(id: string): Promise<CohortApplication> {
    const application = await this.applications.findById(id);

    if (!application) {
      throw new NotFoundError(`Application ${id} does not exist`);
    }

    return application;
  }
}
