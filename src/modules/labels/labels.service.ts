import { Injectable } from "@nestjs/common";
import { LabelsRepository } from "./labels.repository.js";
import { Label } from "../../domain/models.js";



@Injectable()
export class LabelsService {
    constructor(private readonly labelsRepository: LabelsRepository) {}

  listLabels(): Promise<Label[]> {
    return this.labelsRepository.listLabels();
  }
    listLabelsByAssignmentIds(assignmentIds: string[]) {
    return this.labelsRepository.listLabelsByAssignmentIds(assignmentIds);
  }

  getLabelById(id: string): Promise<Label | null> {
    return this.labelsRepository.getLabelById(id);
  }

}