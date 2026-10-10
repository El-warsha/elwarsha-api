import { Injectable } from "@nestjs/common";

import type { Assignment } from "../../domain/models.js";
import { TasksRepository } from "./tasks.repository.js";
import { LabelsService } from "../labels/labels.service.js";

@Injectable()
export class TasksService {
  constructor(
    private readonly tasks: TasksRepository,
    private readonly labels: LabelsService,
  ) {}

  async listAssignments(): Promise<Assignment[]> {
    const assignments = await this.tasks.listAssignments();
    if (assignments.length === 0) return assignments;

    const labelMap = await this.labels.getLabelsByAssignmentIds(
      assignments.map((a) => a.id),
    );

    return assignments.map((assignment) => ({
      ...assignment,
      labels: labelMap.get(assignment.id) ?? [],
    }));
  }
}
