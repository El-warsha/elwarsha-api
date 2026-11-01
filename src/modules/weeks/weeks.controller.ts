import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { WeeksService } from "./weeks.service.js";
import type { Week } from "./weeks.types.js";
import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import { CohortMembershipGuard } from "../identity/cohortMembership.guard.js";

@ApiTags("weeks")
@UseGuards(AuthGuard)
@RequireCapability("weeks.read")
@Controller("api/v1")
export class WeeksController {
  constructor(private readonly weeks: WeeksService) {}

  @UseGuards(CohortMembershipGuard)
  @Get("cohorts/:cohortSlug/weeks")
  listWeeks(
    @Param("cohortSlug") cohortSlug: string,
    @Query("locale") locale?: string,
  ): Promise<Week[]> {
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(cohortSlug, loc);
  }
  @UseGuards(CohortMembershipGuard)
  @Get("cohorts/:cohortSlug/weeks/:weekNumber")
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
