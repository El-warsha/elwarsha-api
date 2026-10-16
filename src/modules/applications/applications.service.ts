import { Injectable, ConflictException } from "@nestjs/common";
import { ApplyCohortDto } from "./dto/apply-cohort.dto";

@Injectable()
export class ApplicationsService {
  private applications: (ApplyCohortDto & { slug: string })[] = [];

  async apply(slug: string, dto: ApplyCohortDto) {
    const existingApplication = this.applications.find(
      (app) =>
        app.slug === slug &&
        (app.email === dto.email || app.githubHandle === dto.githubHandle),
    );

    if (existingApplication) {
      throw new ConflictException({
        title: "Application Already Submitted",
        status: 409,
        detail: "An application with this email or github handle already exists.",
      });
    }

    const newApplication = {
      id: Math.random().toString(36.25, 9),
      slug,
      ...dto,
      status: "received",
    };

    this.applications.push(newApplication);

    return newApplication;
  }
}
