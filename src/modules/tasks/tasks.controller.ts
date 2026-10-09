import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";

import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import { TasksService } from "./tasks.service.js";

@ApiTags("tasks")
@Controller("api/v1")
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get("assignments")
  @RequireCapability("assignments.read")
  @ApiQuery({ name: "label", required: false, description: "Filter assignments by label name" })
  listAssignments(@Query("label") label?: string) {
    return this.tasks.listAssignments(label);
  }
}