import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Assignment } from "../../domain/models.js";

import { TasksRepository } from "./tasks.repository.js";
import { TasksService } from "./tasks.service.js";
import { LabelsService } from "../labels/labels.service.js";

describe("TasksService", () => {
let service: TasksService;
let tasksRepository: {
listAssignments: ReturnType<typeof vi.fn>;
};

const assignments: Assignment[] = [
{
id: "assignment-1",
weekNumber: 1,
title: "Navigate the codebase and open a focused PR",
status: "published",
engagementId: "engagement-1",
labels: [
{
id: "label-1",
name: "frontend",
},
],
},
];

beforeEach(async () => {
tasksRepository = {
listAssignments: vi.fn(),
};


const module: TestingModule = await Test.createTestingModule({
  providers: [
    TasksService,
    {
      provide: TasksRepository,
      useValue: tasksRepository,
    },
    {
      provide: LabelsService,
      useValue: {},
    },
  ],
}).compile();

service = module.get<TasksService>(TasksService);


});

afterEach(() => {
vi.clearAllMocks();
});

it("should be defined", () => {
expect(service).toBeDefined();
});

it("should return assignments from the repository", async () => {
tasksRepository.listAssignments.mockResolvedValue(assignments);


await expect(service.listAssignments()).resolves.toEqual(assignments);

expect(tasksRepository.listAssignments).toHaveBeenCalledWith(undefined);
expect(tasksRepository.listAssignments).toHaveBeenCalledTimes(1);


});

it("should pass the selected label to the repository", async () => {
tasksRepository.listAssignments.mockResolvedValue(assignments);


await expect(
  service.listAssignments("frontend"),
).resolves.toEqual(assignments);

expect(tasksRepository.listAssignments).toHaveBeenCalledWith("frontend");
expect(tasksRepository.listAssignments).toHaveBeenCalledTimes(1);


});

it("should return an empty array when the repository returns no assignments", async () => {
tasksRepository.listAssignments.mockResolvedValue([]);


await expect(service.listAssignments()).resolves.toEqual([]);

expect(tasksRepository.listAssignments).toHaveBeenCalledTimes(1);


});

it("should propagate repository errors", async () => {
const error = new Error("Failed to load assignments");


tasksRepository.listAssignments.mockRejectedValue(error);

await expect(service.listAssignments()).rejects.toThrow(
  "Failed to load assignments",
);


});
});
