import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { matchPrToWeek } from "../github/github-matcher.js";
import type {
  GithubAppClient,
  NormalizedPullRequestSummary,
} from "../github/github.ports.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

export type SubmissionStatusDto = {
  weekNumber: number;
  status: "draft" | "in_review" | "merged";
  prNumber: number | null;
  prUrl: string | null;
  prTitle: string | null;
};

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject("GithubAppClient") private readonly githubClient: GithubAppClient,
  ) {}

  async getOrSyncStudentWeekSubmission(
    userId: string,
    cohortSlug: string,
    weekNumber: number,
  ): Promise<SubmissionStatusDto> {
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        weekNumber,
        engagement: {
          cohort: { slug: cohortSlug },
          status: "active",
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment for week ${weekNumber} not found`);
    }

    const githubIdentity = await this.prisma.externalIdentity.findFirst({
      where: {
        userId,
        provider: "github",
      },
    });

    const studentGithubId =
      githubIdentity?.githubUserId != null
        ? String(githubIdentity.githubUserId)
        : (githubIdentity?.providerSubject ?? "");

    if (!studentGithubId) {
      return {
        weekNumber,
        status: "draft",
        prNumber: null,
        prUrl: null,
        prTitle: null,
      };
    }

    const [apiPrs, webPrs] = await Promise.all([
      this.githubClient.listRepositoryPullRequests("El-Warsha", "elwarsha-api"),
      this.githubClient.listRepositoryPullRequests("El-Warsha", "elwarsha-web"),
    ]);

    const allPrs: NormalizedPullRequestSummary[] = [...apiPrs, ...webPrs];

    const matchingPrs = allPrs.filter(
      (pr) =>
        pr.authorGithubUserId === studentGithubId &&
        pr.state !== "closed" &&
        matchPrToWeek(pr.title, weekNumber),
    );

    const matchedPr =
      matchingPrs.find((pr) => pr.state === "merged") ?? matchingPrs[0] ?? null;

    if (!matchedPr) {
      return {
        weekNumber,
        status: "draft",
        prNumber: null,
        prUrl: null,
        prTitle: null,
      };
    }

    const mappedStatus = matchedPr.state === "merged" ? "merged" : "in_review";

    await this.prisma.submission.upsert({
      where: {
        assignmentId_authorUserId: {
          assignmentId: assignment.id,
          authorUserId: userId,
        },
      },
      update: {
        status: mappedStatus,
        prUrl: matchedPr.htmlUrl,
      },
      create: {
        assignmentId: assignment.id,
        authorUserId: userId,
        status: mappedStatus,
        prUrl: matchedPr.htmlUrl,
      },
    });

    return {
      weekNumber,
      status: mappedStatus,
      prNumber: matchedPr.number,
      prUrl: matchedPr.htmlUrl,
      prTitle: matchedPr.title,
    };
  }
}
