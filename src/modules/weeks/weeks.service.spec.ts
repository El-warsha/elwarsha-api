import { beforeEach, describe, expect, it, vi } from "vitest";
import { afterEach } from "vitest";

import { NotFoundError } from "../../common/errors.js";
import type { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import { WeeksService } from "./weeks.service.js";

describe("WeeksService", () => {
  let service: WeeksService;
  let prismaMock: {
    cohort: {
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    cohortProductEngagement: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const sampleCohort = {
    id: "cohort-1",
    slug: "cohort-01",
    name: "Cohort 01",
    startsOn: new Date("2026-10-01"),
    endsOn: new Date("2026-11-26"),
    engagements: [
      {
        id: "engagement-1",
        assignments: [
          {
            id: "assignment-1",
            weekNumber: 1,
            title: "Navigate the codebase and open a focused PR",
            status: "published" as const,
            labels: [{ label: { name: "frontend" } }, { label: { name: "backend" } }],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    //NEW  I add      vi.useFakeTimers();  vi.setSystemTime(new Date("2026-10-01T00:00:00.000Z"));
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T00:00:00.000Z"));

    prismaMock = {
      cohort: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
      },
      cohortProductEngagement: {
        findFirst: vi.fn(),
      },
    };

    service = new WeeksService(prismaMock as unknown as PrismaService);
  });
  // add afterEach
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("listWeeksForCohort", () => {
    it("returns all 8 weeks with merged DB assignment data in Arabic by default", async () => {
      prismaMock.cohort.findUnique.mockResolvedValue(sampleCohort);

      const weeks = await service.listWeeksForCohort("cohort-01");

      expect(weeks).toHaveLength(8);
      expect(weeks[0]).toMatchObject({
        weekNumber: 1,
        title: "المعمارية وفهم الكود القائم",
        concept: "المعمارية والوحدات",
        startDate: "2026-10-01",
        endDate: "2026-10-07",
        cohort: {
          slug: "cohort-01",
          name: "Cohort 01",
        },
        assignment: {
          id: "assignment-1",
          title: "Navigate the codebase and open a focused PR",
          status: "published",
          labels: ["frontend", "backend"],
          detailsMd: expect.any(String),
        },
      });

      expect(weeks[7].weekNumber).toBe(8);
      expect(weeks[7].assignment).toBeNull();
    });

    it("returns English curriculum content when locale is en", async () => {
      prismaMock.cohort.findUnique.mockResolvedValue(sampleCohort);

      const weeks = await service.listWeeksForCohort("cohort-01", "en");

      expect(weeks[0].concept).toBe("Architecture and modularity");
      expect(weeks[0].title).toBe("Modularity & Codebase Understanding");
    });

    it("locks weeks after current week with upcoming status and empty concept/assignment", async () => {
      prismaMock.cohort.findUnique.mockResolvedValue(sampleCohort);

      const weeks = await service.listWeeksForCohort("cohort-01");
      const week4 = weeks[3];
      expect(week4.weekNumber).toBe(4);
      expect(week4.status).toBe("upcoming");
      expect(week4.isLocked).toBe(true);
      expect(week4.concept).toBe("");
      expect(week4.assignment).toBeNull();
      expect(week4.outcomes).toEqual([]);
      expect(week4.coreConcepts).toEqual([]);
    });

    it("throws NotFoundError when cohort does not exist", async () => {
      prismaMock.cohort.findUnique.mockResolvedValue(null);

      await expect(service.listWeeksForCohort("non-existent")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("getWeekForCohort", () => {
    it("returns complete week details with bigIdea, outcomes, assignment, and resources", async () => {
      prismaMock.cohort.findUnique.mockResolvedValue(sampleCohort);

      const week = await service.getWeekForCohort("cohort-01", 1, "en");

      expect(week.weekNumber).toBe(1);
      expect(week.bigIdea).toBeDefined();
      expect(week.outcomes.length).toBeGreaterThan(0);
      expect(week.coreConcepts.length).toBeGreaterThan(0);
      expect(week.appliedThroughTheStack.length).toBeGreaterThan(0);
      expect(week.assignment).toBeDefined();
      expect(week.assignment?.detailsMd).toMatch(/deliverable/i);
      expect(week.reflectionQuestion).toBeDefined();
      expect(week.prerequisites).toBeDefined();
      expect(week.resources.required.length).toBeGreaterThan(0);
    });

    it("returns locked week with empty outcomes, concepts, and resources for week after current week", async () => {
      prismaMock.cohort.findUnique.mockResolvedValue(sampleCohort);

      const week = await service.getWeekForCohort("cohort-01", 4, "en");

      expect(week.weekNumber).toBe(4);
      expect(week.isLocked).toBe(true);
      expect(week.status).toBe("upcoming");
      expect(week.outcomes).toEqual([]);
      expect(week.coreConcepts).toEqual([]);
      expect(week.appliedThroughTheStack).toEqual([]);
      expect(week.assignment).toBeNull();
      expect(week.resources).toEqual({ required: [], assignment: [], alternative: [] });
    });

    it("throws NotFoundError for week number out of 1-8 bounds", async () => {
      await expect(service.getWeekForCohort("cohort-01", 0)).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.getWeekForCohort("cohort-01", 9)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws NotFoundError when cohort does not exist", async () => {
      prismaMock.cohort.findUnique.mockResolvedValue(null);

      await expect(service.getWeekForCohort("non-existent", 1)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("resolveActiveCohortSlug", () => {
    it("returns the active cohort slug from active engagement", async () => {
      prismaMock.cohortProductEngagement.findFirst.mockResolvedValue({
        cohort: { slug: "cohort-01" },
      });

      const slug = await service.resolveActiveCohortSlug();
      expect(slug).toBe("cohort-01");
    });
  });
});
