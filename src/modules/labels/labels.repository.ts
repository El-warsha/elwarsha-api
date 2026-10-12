import { Injectable } from "@nestjs/common";

import type { AssignmentLabel, Label } from "../../domain/models.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class LabelsRepository {
  constructor(private readonly prisma: PrismaService) {}
  async listLabels(): Promise<Label[]> {
    const labels = await this.prisma.label.findMany({
      orderBy: { name: "asc" },
    });

    return labels.map((label) => ({
      id: label.id,
      name: label.name,
    }));
  }
  async listAssignmentsLabels(assignmentIds: string[]): Promise<AssignmentLabel[]> {
    const AssignmentsLabels = await this.prisma.assignmentLabel.findMany({
      where: { assignmentId: { in: assignmentIds } },
      include: { label: true },
      orderBy: { label: { name: "asc" } },
    });

    return AssignmentsLabels.map((AssignmentsLabel) => ({
      assignmentId: AssignmentsLabel.assignmentId,
      label: { id: AssignmentsLabel.label.id, name: AssignmentsLabel.label.name },
    }));
  }
}
