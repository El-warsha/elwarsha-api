import { UseGuards } from "@nestjs/common";

import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import { CohortMembershipGuard } from "./guards/cohort-membership.guard.js";
import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { WeeksService } from "./weeks.service.js";
import type { Week } from "./weeks.types.js";

@UseGuards(AuthGuard)
@ApiTags("weeks")
@Controller("api/v1")
export class WeeksController {
  constructor(private readonly weeks: WeeksService) {}

  @Get("cohorts/:cohortSlug/weeks")
  @RequireCapability("weeks.read")
  @UseGuards(CohortMembershipGuard)
  listWeeks(
    @Param("cohortSlug") cohortSlug: string,
    @Query("locale") locale?: string,
  ): Promise<Week[]> {
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(cohortSlug, loc);
  }

  @Get("cohorts/:cohortSlug/weeks/:weekNumber")
  @RequireCapability("weeks.read")
  @UseGuards(CohortMembershipGuard)
  getWeek(
    @Param("cohortSlug") cohortSlug: string,
    @Param("weekNumber", ParseIntPipe) weekNumber: number,
    @Query("locale") locale?: string,
  ): Promise<Week> {
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.getWeekForCohort(cohortSlug, weekNumber, loc);
  }

  @Get("weeks")
  @RequireCapability("weeks.read")
  async listDefaultWeeks(@Query("locale") locale?: string): Promise<Week[]> {
    const activeSlug = await this.weeks.resolveActiveCohortSlug();
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(activeSlug, loc);
  }
}