import { Injectable } from "@nestjs/common";

import type { Label } from "../../domain/models.js";
import { LabelsRepository } from "./labels.repository.js";

@Injectable()
export class LabelsService {
  constructor(private readonly labels: LabelsRepository) {}

  listLabels(): Promise<Label[]> {
    return this.labels.listLabels();
  }

  listByAssignmentIds(assignmentIds: string[]): Promise<Map<string, Label[]>> {
    return this.labels.listByAssignmentIds(assignmentIds);
  }
}
