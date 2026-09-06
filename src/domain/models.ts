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
