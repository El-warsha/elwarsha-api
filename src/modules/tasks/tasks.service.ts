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

  const assignmentLabels =
    await this.labels.listAssignmentsLabels(
      assignments.map((assignment) => assignment.id),
    );

  return assignments.map((assignment) => ({
    ...assignment,
    labels: assignmentLabels
      .filter(({ assignmentId }) => assignmentId === assignment.id)
      .map(({ label }) => label),
  }));
}
}