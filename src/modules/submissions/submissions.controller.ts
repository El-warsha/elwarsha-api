import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { SubmissionsService } from './submissions.service.js';
import { AuthGuard, RequireCapability } from '../identity/auth.guard.js';
import { CohortMembershipGuard } from '../weeks/cohort-membership.guard.js';
import { AuthenticatedActor } from '../identity/identity.ports.js';
import type { AssignmentSubmissionsResponse } from './submissions.types.js';

@Controller('api/v1')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get('cohorts/:slug/assignments/:weekNumber/submissions')
  @UseGuards(AuthGuard, CohortMembershipGuard)
  @RequireCapability('submissions.read')
  async getSubmissions(
    @Param('slug') slug: string,
    @Param('weekNumber', ParseIntPipe) weekNumber: number,
    @Req() req: Request & { actor: AuthenticatedActor },
  ): Promise<AssignmentSubmissionsResponse> {
    return this.submissionsService.getAssignmentSubmissions(
      req.actor.user.id,
      slug,
      weekNumber,
    );
  }
}
