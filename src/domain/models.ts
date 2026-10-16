import type { MembershipRole } from "./roles.js";

export type User = {
  id: string;
  displayName: string;
  email: string;
  locale: "ar" | "en";
};

export type Session = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type Membership = {
  id: string;
  userId: string;
  engagementId: string;
  role: MembershipRole;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "active" | "archived";
  repository: {
    githubOwner: string;
    githubRepo: string;
  } | null;
};

export type Cohort = {
  id: string;
  slug: string;
  name: string;
  startsOn: string;
  endsOn: string;
};

export type Engagement = {
  id: string;
  status: "planned" | "active" | "completed";
  cohort: Cohort;
  product: Product;
};

export type Assignment = {
  id: string;
  weekNumber: number;
  title: string;
  status: "draft" | "published" | "closed";
  engagementId: string;
};

export type Submission = {
  id: string;
  assignmentId: string;
  authorUserId: string;
  status: "draft" | "submitted" | "in_review" | "eligible" | "merged" | "withdrawn";
  prUrl: string | null;
  pullRequest: {
    number: number;
    state: "open" | "closed" | "merged";
    approvalCount: number;
    checksPassed: boolean;
  } | null;
};

export type ApplicationStatus =
  "received" | "under_review" | "accepted" | "rejected" | "withdrawn";

export type CohortApplication = {
  id: string;
  cohortSlug: string;
  status: ApplicationStatus;

  fullName: string;
  email: string;
  whatsappNumber: string;
  githubHandle: string;
  discordHandle: string;

  currentStatus: string;
  collegeMajor: string;
  programmingExperience: string;
  technologies: string;
  gitExperience: string;

  personalPageUrl: string;
  githubRepoUrl: string;
  aiUsage: string;

  motivation: string;

  createdAt: Date;
  updatedAt: Date;
};

export type CohortApplicationReceipt = {
  id: string;
  cohortSlug: string;
  email: string;
  status: ApplicationStatus;
  createdAt: Date;
};
