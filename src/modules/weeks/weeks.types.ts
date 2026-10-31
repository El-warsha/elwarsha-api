export type CohortRef = {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
  currentWeekNumber: number; // ← NEW
  startsOn: string;
  endsOn: string;
};

export type WeekResourceItem = {
  title: string;
  url: string;
  layers: string;
  format: "Read" | "Watch" | "Listen" | string;
  time: string;
  why: string;
};

export type WeekResources = {
  required: WeekResourceItem[];
  assignment: WeekResourceItem[];
  alternative: WeekResourceItem[];
};

export type WeekAppliedLayer = {
  layer: string;
  details: string;
};

export type WeekAssignment = {
  id?: string;
  title: string;
  summary: string;
  status: "draft" | "published" | "closed";
  labels: string[];
  detailsMd: string;
};

export type Week = {
  weekNumber: number;
  title: string;
  tagline?: string;
  concept: string;
  guidingQuestion: string;
  startDate: string;
  endDate: string;
  status: "completed" | "active" | "upcoming" | "draft";
  isCurrent: boolean;
  isLocked: boolean;
  cohort: CohortRef;
  bigIdea: string;
  outcomes: string[];
  coreConcepts: string[];
  appliedThroughTheStack: WeekAppliedLayer[];
  assignment: WeekAssignment | null;
  resources: WeekResources;
  reflectionQuestion: string;
  prerequisites: string[];
};
