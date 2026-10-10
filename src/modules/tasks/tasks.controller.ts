import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import { TasksService } from "./tasks.service.js";
import { Assignment } from "../../domain/models.js";

@ApiTags("tasks")
@Controller("api/v1")
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get("assignments")
  @RequireCapability("assignments.read")
  listAssignments() : Promise<Assignment[]> {
    return this.tasks.listAssignments();
  }
}
