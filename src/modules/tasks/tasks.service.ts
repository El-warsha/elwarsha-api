import { Injectable } from "@nestjs/common";

import type { Assignment } from "../../domain/models.js";
import { TasksRepository } from "./tasks.repository.js";

@Injectable()
export class TasksService {
  constructor(private readonly tasks: TasksRepository) {}

  listAssignments(): Promise<Assignment[]> {
    return this.tasks.listAssignments();
  }
}
