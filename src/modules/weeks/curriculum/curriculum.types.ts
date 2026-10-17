import type { WeekAppliedLayer, WeekResources } from "../weeks.types.js";

export type CurriculumWeek = {
  weekNumber: number;
  title: string;
  tagline?: string;
  concept: string;
  guidingQuestion: string;
  bigIdea: string;
  outcomes: string[];
  coreConcepts: string[];
  appliedThroughTheStack: WeekAppliedLayer[];
  assignment: {
    title: string;
    summary: string;
    detailsMd: string;
  };
  resources: WeekResources;
  reflectionQuestion: string;
  prerequisites: string[];
};
