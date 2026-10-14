import { Injectable } from "@nestjs/common";

import type { Assignment } from "../../domain/models.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

 async listAssignments(label?: string): Promise<Assignment[]> {
  const labelFilter = label ? { label: { name: label } } : undefined;

  const records = await this.prisma.assignment.findMany({
   
    where: labelFilter ? { labels: { some: labelFilter } } : undefined,
    include: {
      labels: {
      
        where: labelFilter,
        include: { label: true },
      },
    },
    orderBy: [{ engagementId: "asc" }, { weekNumber: "asc" }],
  });

  return records.map((record) => ({
    id: record.id,
    weekNumber: record.weekNumber,
    title: record.title,
    status: record.status,
    engagementId: record.engagementId,
    labels: record.labels.map((assignmentLabel) => ({
      id: assignmentLabel.label.id,
      name: assignmentLabel.label.name,
    })),
  }));
}
}
