import type { Label } from "../../domain/models.js";

export const LABELS_REPOSITORY = "LabelsRepository";

export type AssignmentLabelRecord = {
  assignmentId: string;
  label: Label;
};

export interface LabelsRepository {
  listAll(): Promise<Label[]>;
  listForAssignments(assignmentIds: string[]): Promise<AssignmentLabelRecord[]>;
}
