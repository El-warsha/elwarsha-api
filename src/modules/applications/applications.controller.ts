import { Controller, Post, Body, Param, ValidationPipe, UsePipes } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { ApplyCohortDto } from "./dto/apply-cohort.dto";
@Controller("api/v1/cohorts")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}
  @Post(":slug/applications")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async applyToCohort(@Param("slug") slug: string, @Body() dto: ApplyCohortDto) {
    return this.applicationsService.apply(slug, dto);
  }
}
