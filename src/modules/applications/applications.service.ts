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
      throw new ConflictException(
        "An application with this email or GitHub handle already exists for this cohort.",
      );
    }

    const newApplication = { slug, ...dto };
    this.applications.push(newApplication);

    return newApplication;
  }
}
