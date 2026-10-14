import { Injectable } from "@nestjs/common";

import type { Assignment } from "../../domain/models.js";
import { TasksRepository } from "./tasks.repository.js";
import { LabelsService } from "../labels/labels.service.js";

@Injectable()
export class TasksService {
  constructor(private readonly tasks: TasksRepository,
        private readonly labels : LabelsService
  ) {}

  listAssignments(label?: string): Promise<Assignment[]> {
  return this.tasks.listAssignments(label);
}
}
