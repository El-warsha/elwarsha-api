import { ConflictException, Injectable } from "@nestjs/common";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";
import { Application } from "./entities/application.entity.js";

@Injectable()
export class ApplicationsService {
  private applications: Application[] = [];

  private isDuplicated = (
    email: string,
    githubHandle: string,
    cohortSlug: string,
    applications: Application[],
  ): boolean => {
    return applications.some(
      (app) =>
        (app.email === email || app.githubHandle === githubHandle) &&
        app.cohortSlug === cohortSlug,
    );
  };

  create(cohortSlug: string, applyCohortDto: ApplyCohortDto) {
    const application = new Application();
    application.id = (this.applications.length + 1).toString();
    application.status = "received";
    application.createdAt = new Date();
    application.cohortSlug = cohortSlug;
    Object.assign(application, applyCohortDto);

    if (
      this.isDuplicated(
        application.email,
        application.githubHandle,
        application.cohortSlug,
        this.applications,
      )
    ) {
      throw new ConflictException({
        type: "duplicate-application",
        title: "Application Already Submitted",
        message:
          "An application with the same email or GitHub handle already exists for this cohort",
        statusCode: 409,
      });
    }

    this.applications.push(application);

    return {
      id: application.id,
      cohortSlug: application.cohortSlug,
      email: application.email,
      status: application.status,
      createdAt: application.createdAt,
    };
  }
}
