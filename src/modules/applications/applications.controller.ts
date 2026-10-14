import { Controller, Post, Body, Param } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { ApplyCohortDto } from "./dto/apply-cohort.dto";
@Controller("cohorts")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}
  @Post(":slug/applications")
  async applyToCohort(@Param("slug") slug: string, @Body() dto: ApplyCohortDto) {
    return this.applicationsService.apply(slug, dto);
  }
}
