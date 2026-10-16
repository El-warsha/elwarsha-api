import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CustomThrottlerGuard } from "../../common/guards/custom-throttler.guard.js";
import { ApplicationsService } from "./applications.service.js";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";

@Controller("api/v1")
@ApiTags("applications")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(CustomThrottlerGuard)
  @Post("cohorts/:cohortSlug/applications")
  create(
    @Param("cohortSlug") cohortSlug: string,
    @Body() applyCohortDto: ApplyCohortDto,
  ) {
    if (!cohortSlug.match(/(cohort-\d+)/))
      throw new NotFoundException(`Cohort ${cohortSlug} not found`);

    return this.applicationsService.create(cohortSlug, applyCohortDto);
  }
}
