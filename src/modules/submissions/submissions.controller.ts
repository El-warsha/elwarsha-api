import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { SubmissionsService } from "./submissions.service.js";

@Controller("api/v1/cohorts")
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get(":slug/assignments/:weekNumber/submissions")
  async getSubmissions(
    @Param("slug") slug: string,
    @Param("weekNumber", ParseIntPipe) weekNumber: number,
  ) {
    const submissions = await this.submissionsService.getAssignmentSubmissions(
      slug,
      weekNumber,
      {},
    );
    return {
      assignmentId: `week-${weekNumber}`,
      weekNumber,
      submissions,
    };
  }
}
