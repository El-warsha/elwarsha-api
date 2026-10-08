import { Injectable } from "@nestjs/common";

import type { Assignment } from "../../domain/models.js";
import { LabelsService } from "../labels/labels.service.js";
import { TasksRepository } from "./tasks.repository.js";

@Injectable()
export class TasksService {
  constructor(
    private readonly tasks: TasksRepository,
    private readonly labels: LabelsService,
  ) {}

  async listAssignments(): Promise<Assignment[]> {
    const assignments = await this.tasks.listAssignments();
    const assignmentLabels = await this.labels.listAssignmentLabels();

    return assignments.map((assignment) => ({
      ...assignment,
      labels: assignmentLabels
        .filter((item) => item.assignmentId === assignment.id)
        .map((item) => item.label),
    }));
  }
}