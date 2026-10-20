import { Injectable } from "@nestjs/common";

import { NotFoundError } from "../../common/errors.js";
import { WeeksRepository } from "./weeks.repository.js";
import { getAllCurriculumWeeks, getCurriculumWeek, type CurriculumWeek } from "./weeks.curriculum.js";
import type { CohortRef, Week, WeekAssignment } from "./weeks.types.js";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class WeeksService {
  constructor(private readonly weeksRepository: WeeksRepository) { }

  async resolveActiveCohortSlug(): Promise<string> {
    const activeEngagement = await this.weeksRepository.findActiveEngagement();

    if (activeEngagement?.cohort) {
      return activeEngagement.cohort.slug;
    }

    const latestCohort = await this.weeksRepository.findLatestCohort();

    return latestCohort?.slug ?? "cohort-01";
  }

  async listWeeksForCohort(
    cohortSlug: string,
    locale: "ar" | "en" = "ar",
  ): Promise<Week[]> {
    const cohort = await this.weeksRepository.findBySlug(cohortSlug)

    if (!cohort) {
      throw new NotFoundError(`Cohort "${cohortSlug}" not found`);
    }

    const cohortRef: CohortRef = {
      id: cohort.id,
      currentWeekNumber: cohort.currentWeekNumber,
      slug: cohort.slug,
      name: locale === "ar" && cohort.nameAr ? cohort.nameAr : cohort.name,
      nameAr: cohort.nameAr,
      startsOn: formatDate(cohort.startsOn),
      endsOn: formatDate(cohort.endsOn),
    };

    const assignments = cohort.engagements.flatMap((e) => e.assignments);
    const curriculumWeeks = getAllCurriculumWeeks(locale);
    const now = new Date();

    // Determine current active week number based on date schedule
    const currentWeekNumber = cohort.currentWeekNumber;

    return curriculumWeeks.map((cWeek) => {
      const weekNumber = cWeek.weekNumber;
      const schedule = this.computeSchedule(
        cohort.startsOn,
        cohort.endsOn,
        weekNumber,
        now,
      );

      // All weeks after the current week are locked with upcoming status
      const isLocked = weekNumber > currentWeekNumber;
      schedule.isCurrent = weekNumber === currentWeekNumber;

      schedule.status =
        isLocked ? "upcoming"
          : schedule.isCurrent ? "active"
            : "completed";  

      const dbAssignment = assignments.find((a) => a.weekNumber === weekNumber);

      return this.buildWeek(cWeek, cohortRef, schedule, isLocked, dbAssignment);
    });
  }

  async getWeekForCohort(
    cohortSlug: string,
    weekNumber: number,
    locale: "ar" | "en" = "ar",
  ): Promise<Week> {
    if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 8) {
      throw new NotFoundError(`Week ${weekNumber} not found. Must be between 1 and 8.`);
    }

    const cohort = await this.weeksRepository.findBySlugAndWeek(cohortSlug, weekNumber);

    if (!cohort) {
      throw new NotFoundError(`Cohort "${cohortSlug}" not found`);
    }

    const curriculum = getCurriculumWeek(weekNumber, locale);
    if (!curriculum) {
      throw new NotFoundError(`Curriculum for week ${weekNumber} not found`);
    }

    const cohortRef: CohortRef = {
      id: cohort.id,
      currentWeekNumber: cohort.currentWeekNumber,
      slug: cohort.slug,
      name: locale === "ar" && cohort.nameAr ? cohort.nameAr : cohort.name,
      nameAr: cohort.nameAr,
      startsOn: formatDate(cohort.startsOn),
      endsOn: formatDate(cohort.endsOn),
    };

    const now = new Date();
    const currentWeekNumber: number = cohort.currentWeekNumber;

    const schedule = this.computeSchedule(
      cohort.startsOn,
      cohort.endsOn,
      weekNumber,
      now,
    );

    const isLocked = weekNumber > currentWeekNumber;
    schedule.isCurrent = weekNumber === currentWeekNumber;

    schedule.status =
      isLocked ? "upcoming"
        : schedule.isCurrent ? "active"
          : "completed";

    const dbAssignment = cohort.engagements.flatMap((e) => e.assignments)[0] ?? null;

    return this.buildWeek(curriculum, cohortRef, schedule, isLocked, dbAssignment);
  }

  private buildWeek(
    cWeek: CurriculumWeek,
    cohortRef: CohortRef,
    schedule: {
      startDate: string;
      endDate: string;
      isCurrent: boolean;
      status: "completed" | "active" | "upcoming" | "draft";
    },
    isLocked: boolean,
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

    const assignment: WeekAssignment = {
      id: dbAssignment?.id,
      title: dbAssignment?.title ?? cWeek.assignment.title,
      summary: cWeek.assignment.summary,
      status: dbAssignment?.status ?? "published",
      labels: dbAssignment ? dbAssignment.labels.map((l) => l.label.name) : ["core"],
      detailsMd: cWeek.assignment.detailsMd,
    };

    const effectiveStatus = dbAssignment?.status === "closed" ? "completed" : schedule.status;

    return {
      weekNumber: cWeek.weekNumber,
      title: cWeek.title,
      tagline: cWeek.tagline,
      concept: cWeek.concept,
      guidingQuestion: cWeek.guidingQuestion,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      isCurrent: schedule.isCurrent,
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
    now: Date,
  ): {
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    status: "completed" | "active" | "upcoming" | "draft";
  } {
    const startMs = startsOn.getTime() + (weekNumber - 1) * 7 * 86_400_000;
    const endMs = Math.min(startMs + 6 * 86_400_000, endsOn.getTime());

    const startDateObj = new Date(startMs);
    const endDateObj = new Date(endMs);

    const nowTime = now.getTime();
    const isCurrent = nowTime >= startMs && nowTime <= endMs + 86_399_999;

    let status: "completed" | "active" | "upcoming" | "draft" = "upcoming";
    if (nowTime > endMs + 86_399_999) {
      status = "completed";
    } else if (isCurrent) {
      status = "active";
    } else {
      status = "upcoming";
    }

    return {
      startDate: formatDate(startDateObj),
      endDate: formatDate(endDateObj),
      isCurrent,
      status,
    };
  }
}
