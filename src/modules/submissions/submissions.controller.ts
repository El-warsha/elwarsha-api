import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import type { AuthenticatedActor } from "../identity/identity.ports.js";
import { CohortMembershipGuard } from "../weeks/cohort-membership.guard.js";
import { SubmissionsService } from "./submissions.service.js";

@ApiTags("submissions")
@Controller("api/v1")
@UseGuards(AuthGuard)
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Get("cohorts/:cohortSlug/assignments/:weekNumber/submissions")
  @UseGuards(CohortMembershipGuard)
  @RequireCapability("weeks.read")
  async getAssignmentSubmissions(
    @Param("cohortSlug") cohortSlug: string,
    @Param("weekNumber", ParseIntPipe) weekNumber: number,
    @Req() req: Request & { actor: AuthenticatedActor },
  ) {
    return this.submissions.getAssignmentSubmissions(
      cohortSlug,
      weekNumber,
      req.actor.user.id,
    );
  }
}