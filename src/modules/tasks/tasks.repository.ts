import { Injectable } from "@nestjs/common";

import type { Page, PageQuery ,  AssignmentQuery} from "../../common/pagination.js";
import { resolveLimit } from "../../common/pagination.js";
import type { Assignment } from "../../domain/models.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";


@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listAssignments(
    query: AssignmentQuery,
  ): Promise<Page<Assignment>> {
    const limit = resolveLimit(query.limit);

    const whereCondition = query.labelId
      ? {
          labels: {
            some: {
              labelId: query.labelId,
            },
          },
        }
      : undefined;

    const records = await this.prisma.assignment.findMany({
      where: whereCondition,

      orderBy: [
        { engagementId: "asc" },
        { weekNumber: "asc" },
      ],

      take: limit + 1,

      ...(query.cursor
        ? {
            cursor: {
              id: query.cursor,
            },
            skip: 1,
          }
        : {}),
    });

    const hasNextPage = records.length > limit;

    const items = hasNextPage
      ? records.slice(0, limit)
      : records;

    const nextCursor = hasNextPage
      ? items[items.length - 1]?.id ?? null
      : null;

    return {
      items: items.map((record) => ({
        id: record.id,
        weekNumber: record.weekNumber,
        title: record.title,
        status: record.status,
        engagementId: record.engagementId,
        labels: [],
      })),
      nextCursor,
    };
  }
}