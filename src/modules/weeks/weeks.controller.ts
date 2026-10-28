import { Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { WeeksService } from "./weeks.service.js";
import type { Week } from "./weeks.types.js";
import { AuthGuard } from "../identity/auth.guard.js";
import { RequireCapability } from "../identity/auth.guard.js";
import { AuthenticatedActor } from "../identity/identity.ports.js";

@ApiTags("weeks")
@UseGuards(AuthGuard)
@RequireCapability("weeks.read")
@Controller("api/v1")
export class WeeksController {
  constructor(private readonly weeks: WeeksService) { }

  @Get("cohorts/:cohortSlug/weeks")
  listWeeks(
    @Param("cohortSlug") cohortSlug: string,
    @Req() req: Request & { actor: AuthenticatedActor },
    @Query("locale") locale?: string,
  ): Promise<Week[]> {
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(cohortSlug, loc, req.actor);
  }

  @Get("cohorts/:cohortSlug/weeks/:weekNumber")
  getWeek(
    @Param("cohortSlug") cohortSlug: string,
    @Param("weekNumber", ParseIntPipe) weekNumber: number,
    @Req() req: Request & { actor: AuthenticatedActor },
    @Query("locale") locale?: string,
  ): Promise<Week> {
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.getWeekForCohort(cohortSlug, weekNumber, loc, req.actor);
  }

  @Get("weeks")
  async listDefaultWeeks(@Query("locale") locale?: string): Promise<Week[]> {
    const activeSlug = await this.weeks.resolveActiveCohortSlug();
    const loc = locale === "en" ? "en" : "ar";
    return this.weeks.listWeeksForCohort(activeSlug, loc);
  }
}

