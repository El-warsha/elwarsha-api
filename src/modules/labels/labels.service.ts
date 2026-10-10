import { Injectable } from "@nestjs/common";

import type { AssignmentLabel, Label } from "../../domain/models.js";
import { LabelsRepository } from "./labels.repository.js";

@Injectable()
export class LabelsService {
  constructor(private readonly labels: LabelsRepository) {}

  listLabels(): Promise<Label[]> {
    return this.labels.listLabels();
  }

  listAssignmentsLabels(assignmentIds: string[]): Promise<AssignmentLabel[]> {
    return this.labels.listAssignmentsLabels(assignmentIds);
  }
}
