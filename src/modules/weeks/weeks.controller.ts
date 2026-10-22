import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { WeeksService } from "./weeks.service.js";
import type { Week } from "./weeks.types.js";

@ApiTags("weeks")
@Controller("api/v1")
export class WeeksController {
  constructor(private readonly weeks: WeeksService) {}

  @ApiOperation({
    summary: "Get all weeks for a cohort",
    description:
      "Returns all 8 weeks for the specified cohort, including lock status and current week information.",
  })
  @ApiParam({
    name: "cohortSlug",
    type: String,
    description: "The unique slug of the cohort",
    example: "cohort-01",
  })
  @ApiQuery({
    name: "locale",
    required: false,
    enum: ["ar", "en"],
    description: "The response language",
    example: "en",
  })
  @Get("cohorts/:cohortSlug/weeks")
  listWeeks(
    @Param("cohortSlug") cohortSlug: string,
    @Query("locale") locale?: string,
  ): Promise<Week[]> {
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(cohortSlug, loc);
  }

  @ApiOperation({
    summary: "Get week details",
    description:
      "Returns the details of a specific week, including its content, assignment, and resources.",
  })
  @ApiParam({
    name: "cohortSlug",
    type: String,
    description: "The unique slug of the cohort",
    example: "cohort-01",
  })
  @ApiParam({
    name: "weekNumber",
    type: Number,
    description: "The week number, from 1 to 8",
    example: 3,
  })
  @ApiQuery({
    name: "locale",
    required: false,
    enum: ["ar", "en"],
    description: "The response language",
    example: "en",
  })
  @Get("cohorts/:cohortSlug/weeks/:weekNumber")
  getWeek(
    @Param("cohortSlug") cohortSlug: string,
    @Param("weekNumber", ParseIntPipe) weekNumber: number,
    @Query("locale") locale?: string,
  ): Promise<Week> {
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.getWeekForCohort(cohortSlug, weekNumber, loc);
  }

  @ApiOperation({
    summary: "Get weeks for the active cohort",
    description:
      "Resolves the active cohort and returns its weeks in the requested language.",
  })
  @ApiQuery({
    name: "locale",
    required: false,
    enum: ["ar", "en"],
    description: "The response language",
    example: "en",
  })
  @Get("weeks")
  async listDefaultWeeks(@Query("locale") locale?: string): Promise<Week[]> {
    const activeSlug = await this.weeks.resolveActiveCohortSlug();
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(activeSlug, loc);
  }
}
