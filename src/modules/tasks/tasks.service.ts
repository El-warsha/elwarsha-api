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
    if (assignments.length === 0) {
      return [];
    }

    const labelsByAssignmentId = await this.labels.findLabelsByAssignmentIds(
      assignments.map((assignment) => assignment.id),
    );

    return assignments.map((assignment) => ({
      ...assignment,
      labels: labelsByAssignmentId.get(assignment.id) ?? [],
    }));
  }
}
