import { Injectable } from "@nestjs/common";

import type { Assignment, Label } from "../../domain/models.js";
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
    const labelRecords = await this.labels.listForAssignments(
      assignments.map((assignment) => assignment.id),
    );
    const labelsByAssignmentId = new Map<string, Label[]>();

    for (const { assignmentId, label } of labelRecords) {
      const assignmentLabels = labelsByAssignmentId.get(assignmentId) ?? [];
      assignmentLabels.push(label);
      labelsByAssignmentId.set(assignmentId, assignmentLabels);
    }

    return assignments.map((assignment) => ({
      ...assignment,
      labels: labelsByAssignmentId.get(assignment.id) ?? [],
    }));
  }
}
