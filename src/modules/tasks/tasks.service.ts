import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import type {
  AssignmentQuery,
  Page,
} from "../../common/pagination.js";
import type { Assignment } from "../../domain/models.js";
import { LabelsService } from "../labels/labels.service.js";
import { TasksRepository } from "./tasks.repository.js";
import { NotFoundError } from "../../common/errors.js";

@Injectable()
export class TasksService {
  constructor(
    private readonly tasks: TasksRepository,
    private readonly labels: LabelsService,
  ) {}

  async listAssignments(
    query: AssignmentQuery = {},
  ): Promise<Page<Assignment>> {
    if (query.labelId) {
      const label = await this.labels.getLabelById(query.labelId);

      if (!label) {
       throw new NotFoundError(
          `Label with id "${query.labelId}" does not exist.`,
        );
      }
    }

    const page = await this.tasks.listAssignments(query);

    const assignmentIds = page.items.map(
      (assignment) => assignment.id,
    );

    if (assignmentIds.length === 0) {
      return page;
    }

    const assignmentLabels =
      await this.labels.listLabelsByAssignmentIds(assignmentIds);

    const labelsByAssignmentId = new Map<
      string,
      Assignment["labels"]
    >();

    for (const assignmentLabel of assignmentLabels) {
      const currentLabels =
        labelsByAssignmentId.get(assignmentLabel.assignmentId) ?? [];

      currentLabels.push(assignmentLabel.label);

      labelsByAssignmentId.set(
        assignmentLabel.assignmentId,
        currentLabels,
      );
    }

    return {
      ...page,
      items: page.items.map((assignment) => ({
        ...assignment,
        labels:
          labelsByAssignmentId.get(assignment.id) ?? [],
      })),
    };
  }
}