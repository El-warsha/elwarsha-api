import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import { CohortMembershipGuard } from "../identity/cohort-membership.guard.js";
import { WeeksService } from "./weeks.service.js";
import type { Week } from "./weeks.types.js";

@ApiTags("weeks")
@Controller("api/v1")
@UseGuards(AuthGuard)
@RequireCapability("weeks.read")
export class WeeksController {
  constructor(private readonly weeks: WeeksService) {}

  @Get("cohorts/:cohortSlug/weeks")
  @UseGuards(CohortMembershipGuard)
  listWeeks(
    @Param("cohortSlug") cohortSlug: string,
    @Query("locale") locale?: string,
  ): Promise<Week[]> {
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(cohortSlug, loc);
  }

  @Get("cohorts/:cohortSlug/weeks/:weekNumber")
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
  async listDefaultWeeks(@Query("locale") locale?: string): Promise<Week[]> {
    const activeSlug = await this.weeks.resolveActiveCohortSlug();
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(activeSlug, loc);
  }
}
