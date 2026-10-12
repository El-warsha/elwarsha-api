/*import { Injectable } from "@nestjs/common";

import type { Assignment } from "../../domain/models.js";
import { TasksRepository } from "./tasks.repository.js";

@Injectable()
export class TasksService {
  constructor(private readonly tasks: TasksRepository) {}

  listAssignments(): Promise<Assignment[]> {
    return this.tasks.listAssignments();
  }
}*/

import { Injectable } from "@nestjs/common";
import type { AssignmentWithLabels } from "../../domain/models.js";
import { LabelsService } from "../labels/labels.service.js";
import { TasksRepository } from "./tasks.repository.js";

@Injectable()
export class TasksService {
  constructor(
    private readonly tasks: TasksRepository,
    private readonly labels: LabelsService,
  ) {}

  async listAssignments(): Promise<AssignmentWithLabels[]> {
    const assignments = await this.tasks.listAssignments();
    const links = await this.labels.listAssignmentsLabels(
      assignments.map((assignment) => assignment.id),
    );

    return assignments.map((assignment) => ({
      ...assignment,
      labels: links
        .filter((link) => link.assignmentId === assignment.id)
        .map((link) => link.label),
    }));
  }
}
