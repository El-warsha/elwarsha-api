import { Injectable } from '@nestjs/common';
import { LabelsRepository } from './labels.repository.js';


@Injectable()
export class LabelsService {
  constructor(private readonly repository:LabelsRepository){}


  listLabels() {
    return this.repository.listLabels()
  }
  listAssignmentsLabels(assignmentIds: string[]) {
    return this.repository.listAssignmentsLabels(assignmentIds);
  }

}
