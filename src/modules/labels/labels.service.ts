import { Injectable } from "@nestjs/common";

import type { AssignmentLabel } from "../../domain/models.js";
import { LabelsRepository } from "./labels.repository.js";

@Injectable()
export class LabelsService {
  constructor(private readonly labels: LabelsRepository) {}

  listAssignmentLabels(): Promise<AssignmentLabel[]> {
    return this.labels.listAssignmentLabels();
  }
}
