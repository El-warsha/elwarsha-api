import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { UnauthorizedError } from "../../common/errors.js";
import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import type { AuthenticatedActor } from "../identity/identity.ports.js";
import { CohortMembershipGuard } from "../weeks/cohort-membership.guard.js";
import { SubmissionsService } from "./submissions.service.js";
import type { AssignmentSubmissionsResponse } from "./submissions.types.js";

@ApiTags("submissions")
@Controller("api/v1")
@UseGuards(AuthGuard)
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Get("cohorts/:cohortSlug/assignments/:weekNumber/submissions")
  @UseGuards(CohortMembershipGuard)
  @RequireCapability("submissions.read")
  async getAssignmentSubmissions(
    @Param("cohortSlug") cohortSlug: string,
    @Param("weekNumber", ParseIntPipe) weekNumber: number,
    @Req() request: Request & { actor?: AuthenticatedActor },
  ): Promise<AssignmentSubmissionsResponse> {
    const actor = request.actor;
    if (!actor) {
      throw new UnauthorizedError();
    }

    return this.submissions.getAssignmentSubmissions(
      cohortSlug,
      weekNumber,
      actor.user.id,
    );
  }
}
