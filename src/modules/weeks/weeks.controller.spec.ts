import { beforeEach, describe, expect, it, vi } from "vitest";

import { WeeksController } from "./weeks.controller.js";
import type { WeeksService } from "./weeks.service.js";

describe("WeeksController", () => {
  let controller: WeeksController;
  let serviceMock: {
    listWeeksForCohort: ReturnType<typeof vi.fn>;
    getWeekForCohort: ReturnType<typeof vi.fn>;
    resolveActiveCohortSlug: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    serviceMock = {
      listWeeksForCohort: vi.fn(),
      getWeekForCohort: vi.fn(),
      resolveActiveCohortSlug: vi.fn(),
    };

    controller = new WeeksController(serviceMock as unknown as WeeksService);
  });

  it("delegates listWeeks with default Arabic locale", async () => {
    serviceMock.listWeeksForCohort.mockResolvedValue([]);

    await controller.listWeeks("cohort-01");

    expect(serviceMock.listWeeksForCohort).toHaveBeenCalledWith("cohort-01", "ar");
  });

  it("delegates listWeeks with English locale when requested", async () => {
    serviceMock.listWeeksForCohort.mockResolvedValue([]);

    await controller.listWeeks("cohort-01", "en");

    expect(serviceMock.listWeeksForCohort).toHaveBeenCalledWith("cohort-01", "en");
  });

  it("delegates getWeek with weekNumber and locale", async () => {
    serviceMock.getWeekForCohort.mockResolvedValue({ weekNumber: 2 });

    const result = await controller.getWeek("cohort-01", 2, "en");

    expect(serviceMock.getWeekForCohort).toHaveBeenCalledWith("cohort-01", 2, "en");
    expect(result).toEqual({ weekNumber: 2 });
  });

  it("delegates listDefaultWeeks by resolving active cohort first", async () => {
    serviceMock.resolveActiveCohortSlug.mockResolvedValue("cohort-01");
    serviceMock.listWeeksForCohort.mockResolvedValue([]);

    await controller.listDefaultWeeks("en");

    expect(serviceMock.resolveActiveCohortSlug).toHaveBeenCalled();
    expect(serviceMock.listWeeksForCohort).toHaveBeenCalledWith("cohort-01", "en");
  });
});
