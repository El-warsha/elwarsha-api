import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { UnauthorizedError } from "../../common/errors.js";
import { AuthGuard } from "../identity/auth.guard.js";
import type { AuthenticatedActor } from "../identity/identity.ports.js";
import { CohortMembershipGuard } from "../weeks/cohort-membership.guard.js";
import { SubmissionsService } from "./submissions.service.js";
import type { AssignmentSubmissionsResponse } from "./submissions.types.js";

@ApiTags("submissions")
@Controller("api/v1/cohorts/:cohortSlug/assignments/:weekNumber/submissions")
@UseGuards(AuthGuard, CohortMembershipGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  async getSubmissions(
    @Param("cohortSlug") cohortSlug: string,
    @Param("weekNumber", ParseIntPipe) weekNumber: number,
    @Req() request: Request & { actor?: AuthenticatedActor },
  ): Promise<AssignmentSubmissionsResponse> {
    if (!request.actor) {
      throw new UnauthorizedError();
    }
    return this.submissionsService.getSubmissions(
      request.actor.user.id,
      cohortSlug,
      weekNumber,
    );
  }
}
