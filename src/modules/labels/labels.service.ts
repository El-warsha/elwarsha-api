import { Inject, Injectable } from "@nestjs/common";

import type { Label } from "../../domain/models.js";
import {
  LABELS_REPOSITORY,
  type AssignmentLabelRecord,
  type LabelsRepository,
} from "./labels.repository.js";

@Injectable()
export class LabelsService {
  constructor(
    @Inject(LABELS_REPOSITORY)
    private readonly labels: LabelsRepository,
  ) {}

  listAll(): Promise<Label[]> {
    return this.labels.listAll();
  }

  listForAssignments(assignmentIds: string[]): Promise<AssignmentLabelRecord[]> {
    return this.labels.listForAssignments(assignmentIds);
  }
}
