import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import { TasksService } from "./tasks.service.js";

@ApiTags("tasks")
@Controller("api/v1")
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get("assignments")
  @RequireCapability("assignments.read")
  listAssignments() {
    return this.tasks.listAssignments();
  }
}
