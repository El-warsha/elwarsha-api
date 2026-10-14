import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiQuery, ApiTags  } from "@nestjs/swagger";


import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";

import { TasksService } from "./tasks.service.js";
import { AssignmentQueryDto } from "./dto/assignment-query.dto.js";

@ApiTags("tasks")
@Controller("api/v1")
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get("assignments")
  @RequireCapability("assignments.read")

listAssignments(@Query() query: AssignmentQueryDto) {
    return this.tasks.listAssignments(query);
  }
}