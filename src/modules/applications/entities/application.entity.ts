import { CurrentStatus, GitExperience } from "../dto/apply-cohort.dto.js";

export class Application {
  id: string;
  cohortSlug: string;
  status: "received" | "approved" | "rejected";
  createdAt: Date;

  fullName: string;
  email: string;
  whatsappNumber: string;
  githubHandle: string;
  discordHandle: string;
  currentStatus: CurrentStatus;
  collegeMajor: string;
  programmingExperience: string;
  technologies: string;
  gitExperience: GitExperience;
  personalPageUrl: string;
  githubRepoUrl: string;
  aiUsage: string;
  motivation: string;
}
