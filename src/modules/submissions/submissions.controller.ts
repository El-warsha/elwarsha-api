import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { SubmissionsService, type SubmissionStatusDto } from "./submissions.service.js";
import { AuthGuard } from "../identity/auth.guard.js";
import { AuthenticatedActor } from "../identity/identity.ports.js";

@ApiTags("submissions")
@Controller("api/v1")
@UseGuards(AuthGuard)
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Get("cohorts/:cohortSlug/weeks/:weekNumber/submission")
  getMyWeekSubmission(
    @Req() request: Request & { actor: AuthenticatedActor },
    @Param("cohortSlug") cohortSlug: string,
    @Param("weekNumber", ParseIntPipe) weekNumber: number,
  ): Promise<SubmissionStatusDto> {
    return this.submissions.getOrSyncStudentWeekSubmission(
      request.actor.user.id,
      cohortSlug,
      weekNumber,
    );
  }
}
