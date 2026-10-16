import { Injectable } from "@nestjs/common";

import type { Label } from "../../domain/models.js";
import { LabelsRepository } from "./labels.repository.js";

@Injectable()
export class LabelsService {
  constructor(private readonly repository: LabelsRepository) {}

  async listForAssignments(assignmentIds: string[]): Promise<Map<string, Label[]>> {
    return this.repository.listForAssignments(assignmentIds);
  }
}
