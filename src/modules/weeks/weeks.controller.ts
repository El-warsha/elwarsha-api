import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { WeeksService } from "./weeks.service.js";
import type { Week } from "./weeks.types.js";
import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import { CohortMembershipGuard } from "./cohort-membership.guard.js";

@ApiTags("weeks")
@Controller("api/v1")
export class WeeksController {
  constructor(private readonly weeks: WeeksService) {}
 
  @Get("cohorts/:cohortSlug/weeks")
  @UseGuards(AuthGuard, CohortMembershipGuard)
   @RequireCapability("weeks.read")
  listWeeks(
    @Param("cohortSlug") cohortSlug: string,
    @Query("locale") locale?: string,
  ): Promise<Week[]> {
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(cohortSlug, loc);
  }

  @Get("cohorts/:cohortSlug/weeks/:weekNumber")
   @UseGuards(AuthGuard, CohortMembershipGuard)
  @RequireCapability("weeks.read")
  getWeek(
    @Param("cohortSlug") cohortSlug: string,
    @Param("weekNumber", ParseIntPipe) weekNumber: number,
    @Query("locale") locale?: string,
  ): Promise<Week> {
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.getWeekForCohort(cohortSlug, weekNumber, loc);
  }

  @Get("weeks")
    @UseGuards(AuthGuard)
  @RequireCapability("weeks.read")
  async listDefaultWeeks(@Query("locale") locale?: string): Promise<Week[]> {
    const activeSlug = await this.weeks.resolveActiveCohortSlug();
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(activeSlug, loc);
  }
}
