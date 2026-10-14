
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundError } from "../../common/errors.js";
import type { Assignment } from "../../domain/models.js";
import { LabelsService } from "../labels/labels.service.js";
import { TasksRepository } from "./tasks.repository.js";
import { TasksService } from "./tasks.service.js";

describe("TasksService", () => {
  let service: TasksService;

  const tasksRepositoryMock = {
    listAssignments: vi.fn<TasksRepository["listAssignments"]>(),
  };

  const labelsServiceMock = {
    getLabelById: vi.fn<LabelsService["getLabelById"]>(),
    listLabelsByAssignmentIds:
      vi.fn<LabelsService["listLabelsByAssignmentIds"]>(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: tasksRepositoryMock },
        { provide: LabelsService, useValue: labelsServiceMock },
      ],
    }).compile();

    service = moduleRef.get<TasksService>(TasksService);
  });

  it("returns assignments with an empty labels array when no labels are found", async () => {
    const assignment: Assignment = {
      id: "assignment-1",
      weekNumber: 1,
      title: "Learn React",
      status: "published",
      engagementId: "engagement-1",
      labels: [],
    };

    const page = {
      items: [assignment],
      nextCursor: null,
    };

    tasksRepositoryMock.listAssignments.mockResolvedValue(page);
    labelsServiceMock.listLabelsByAssignmentIds.mockResolvedValue([]);

    const result = await service.listAssignments();

    expect(result.items[0]?.labels).toEqual([]);
    expect(
      labelsServiceMock.listLabelsByAssignmentIds,
    ).toHaveBeenCalledWith(["assignment-1"]);
  });

  it("returns the empty page without fetching labels when there are no assignments", async () => {
    const page = {
      items: [],
      nextCursor: null,
    };

    tasksRepositoryMock.listAssignments.mockResolvedValue(page);

    const result = await service.listAssignments();

    expect(result).toEqual(page);
    expect(
      labelsServiceMock.listLabelsByAssignmentIds,
    ).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the requested label does not exist", async () => {
    labelsServiceMock.getLabelById.mockResolvedValue(null);

    await expect(
      service.listAssignments({ labelId: "missing-label" }),
    ).rejects.toThrow(NotFoundError);

    expect(
      tasksRepositoryMock.listAssignments,
    ).not.toHaveBeenCalled();
  });

  it("attaches each label to its correct assignment", async () => {
  const assignments: Assignment[] = [
    {
      id: "assignment-1",
      weekNumber: 1,
      title: "Learn NestJS",
      status: "published",
      engagementId: "engagement-1",
      labels: [],
    },
    {
      id: "assignment-2",
      weekNumber: 2,
      title: "Learn React",
      status: "published",
      engagementId: "engagement-1",
      labels: [],
    },
  ];

  const page = {
    items: assignments,
    nextCursor: null,
  };

  tasksRepositoryMock.listAssignments.mockResolvedValue(page);

  labelsServiceMock.listLabelsByAssignmentIds.mockResolvedValue([
    {
      assignmentId: "assignment-1",
      labelId: "label-1",
      label: {
        id: "label-1",
        name: "Backend",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    },
    {
      assignmentId: "assignment-2",
      labelId: "label-2",
      label: {
        id: "label-2",
        name: "React",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    },
  ]);

  const result = await service.listAssignments();

 expect(result.items[0]?.labels).toEqual([
  {
    id: "label-1",
    name: "Backend",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
]);
expect(result.items[1]?.labels).toEqual([
  {
    id: "label-2",
    name: "React",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
]);
  expect(
    labelsServiceMock.listLabelsByAssignmentIds,
  ).toHaveBeenCalledWith(["assignment-1", "assignment-2"]);
});
});

