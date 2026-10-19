
import { Injectable } from "@nestjs/common";

import { NotFoundError } from "../../common/errors.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import {
  getAllCurriculumWeeks,
  getCurriculumWeek,
  type CurriculumWeek,
} from "./weeks.curriculum.js";
import type {
  CohortRef,
  Week,
  WeekAssignment,
  WeekStatus,
} from "./weeks.types.js";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class WeeksService {
  constructor(private readonly prisma: PrismaService) { }

  async resolveActiveCohortSlug(): Promise<string> {
    const activeEngagement =
      await this.prisma.cohortProductEngagement.findFirst({
        where: { status: "active" },
        include: { cohort: true },
        orderBy: { createdAt: "desc" },
      });

    if (activeEngagement?.cohort) {
      return activeEngagement.cohort.slug;
    }

    const latestCohort = await this.prisma.cohort.findFirst({
      orderBy: { startsOn: "desc" },
    });

    return latestCohort?.slug ?? "cohort-01";
  }

  async listWeeksForCohort(
    cohortSlug: string,
    locale: "ar" | "en" = "ar",
  ): Promise<Week[]> {
    const cohort = await this.prisma.cohort.findUnique({
      where: { slug: cohortSlug },
      include: {
        engagements: {
          include: {
            assignments: {
              include: {
                labels: {
                  include: {
                    label: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cohort) {
      throw new NotFoundError(`Cohort "${cohortSlug}" not found`);
    }

    const cohortRef = this.buildCohortRef(cohort, locale);
    const assignments = cohort.engagements.flatMap((e) => e.assignments);
    const curriculumWeeks = getAllCurriculumWeeks(locale);

    const currentWeekNumber = cohort.currentWeekNumber;

    return curriculumWeeks.map((cWeek) => {
      const weekNumber = cWeek.weekNumber;

      const schedule = this.computeSchedule(
        cohort.startsOn,
        cohort.endsOn,
        weekNumber,
      );
      // All weeks after the current week are locked with upcoming status.
      const isLocked = weekNumber > currentWeekNumber;

      const dbAssignment = assignments.find(
        (a) => a.weekNumber === weekNumber,
      );

      return this.buildWeek(
        cWeek,
        cohortRef,
        schedule,
        isLocked,
        currentWeekNumber,
        dbAssignment,
      );
    });
  }

  async getWeekForCohort(
    cohortSlug: string,
    weekNumber: number,
    locale: "ar" | "en" = "ar",
  ): Promise<Week> {
    if (
      !Number.isInteger(weekNumber) ||
      weekNumber < 1 ||
      weekNumber > 8
    ) {
      throw new NotFoundError(
        `Week ${weekNumber} not found. Must be between 1 and 8.`,
      );
    }

    const cohort = await this.prisma.cohort.findUnique({
      where: { slug: cohortSlug },
      include: {
        engagements: {
          include: {
            assignments: {
              where: { weekNumber },
              include: {
                labels: {
                  include: {
                    label: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cohort) {
      throw new NotFoundError(`Cohort "${cohortSlug}" not found`);
    }

    const curriculum = getCurriculumWeek(weekNumber, locale);

    if (!curriculum) {
      throw new NotFoundError(
        `Curriculum for week ${weekNumber} not found`,
      );
    }

    const cohortRef = this.buildCohortRef(cohort, locale);
    const currentWeekNumber = cohort.currentWeekNumber;


    const schedule = this.computeSchedule(
      cohort.startsOn,
      cohort.endsOn,
      weekNumber,
    );

    const isLocked = weekNumber > currentWeekNumber;

    const dbAssignment =
      cohort.engagements.flatMap((e) => e.assignments)[0] ?? null;

    return this.buildWeek(
      curriculum,
      cohortRef,
      schedule,
      isLocked,
      currentWeekNumber,
      dbAssignment,
    );
  }

  private buildWeek(
    cWeek: CurriculumWeek,
    cohortRef: CohortRef,
    schedule: {
      startDate: string;
      endDate: string;
    },
    isLocked: boolean,
    currentWeekNumber: number,
    dbAssignment?: {
      id: string;
      title: string;
      status: "draft" | "published" | "closed";
      labels: { label: { name: string } }[];
    } | null,
  ): Week {
    if (isLocked) {
      return {
        weekNumber: cWeek.weekNumber,
        title: cWeek.title,
        tagline: cWeek.tagline,
        concept: "",
        guidingQuestion: "",
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        isCurrent: false,
        status: "upcoming",
        isLocked: true,
        cohort: cohortRef,
        bigIdea: "",
        outcomes: [],
        coreConcepts: [],
        appliedThroughTheStack: [],
        assignment: null,
        resources: {
          required: [],
          assignment: [],
          alternative: [],
        },
        reflectionQuestion: "",
        prerequisites: [],
      };
    }

    const isCurrent = cWeek.weekNumber === currentWeekNumber;

    const assignment: WeekAssignment = {
      id: dbAssignment?.id,
      title: dbAssignment?.title ?? cWeek.assignment.title,
      summary: cWeek.assignment.summary,
      status: dbAssignment?.status ?? "published",
      labels: dbAssignment
        ? dbAssignment.labels.map((l) => l.label.name)
        : ["core"],
      detailsMd: cWeek.assignment.detailsMd,
    };

    const effectiveStatus: WeekStatus = isCurrent
      ? "active"
      : cWeek.weekNumber < currentWeekNumber ||
        dbAssignment?.status === "closed"
        ? "completed"
        : "upcoming";

    return {
      weekNumber: cWeek.weekNumber,
      title: cWeek.title,
      tagline: cWeek.tagline,
      concept: cWeek.concept,
      guidingQuestion: cWeek.guidingQuestion,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      isCurrent,
      status: effectiveStatus,
      isLocked: false,
      cohort: cohortRef,
      bigIdea: cWeek.bigIdea,
      outcomes: cWeek.outcomes,
      coreConcepts: cWeek.coreConcepts,
      appliedThroughTheStack: cWeek.appliedThroughTheStack,
      assignment,
      resources: cWeek.resources,
      reflectionQuestion: cWeek.reflectionQuestion,
      prerequisites: cWeek.prerequisites,
    };
  }

  private computeSchedule(
    startsOn: Date,
    endsOn: Date,
    weekNumber: number,
  ): {
    startDate: string;
    endDate: string;
  } {
    const startMs =
      startsOn.getTime() + (weekNumber - 1) * 7 * 86_400_000;

    const endMs = Math.min(
      startMs + 6 * 86_400_000,
      endsOn.getTime(),
    );

    return {
      startDate: formatDate(new Date(startMs)),
      endDate: formatDate(new Date(endMs)),
    };
  }

  private buildCohortRef(
    cohort: {
      id: string;
      slug: string;
      name: string;
      nameAr: string | null;
      startsOn: Date;
      endsOn: Date;
      currentWeekNumber: number;
    },
    locale: "ar" | "en",
  ): CohortRef {
    return {
      id: cohort.id,
      slug: cohort.slug,
      name:
        locale === "ar" && cohort.nameAr
          ? cohort.nameAr
          : cohort.name,
      nameAr: cohort.nameAr,
      startsOn: formatDate(cohort.startsOn),
      endsOn: formatDate(cohort.endsOn),
      currentWeekNumber: cohort.currentWeekNumber,
    };
  }
}
