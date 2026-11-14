import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppEnv } from "../../config/env.js";
import { HttpGithubAppClient } from "./http-github.client.js";

const makeEnv = (token = "fake-github-token") =>
  ({
    GITHUB_TOKEN: token,
    GITHUB_WEBHOOK_SECRET: "test-secret-123",
  }) as unknown as AppEnv;

const rawPr = (overrides: Record<string, unknown> = {}) => ({
  id: 12345,
  number: 42,
  title: "[week-06] My test PR",
  state: "open",
  html_url: "https://github.com/test-owner/test-repo/pull/42",
  merged_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  user: { id: 999, login: "eman-dev" },
  ...overrides,
});

const mockFetchOk = (body: unknown) => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => body });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const sentHeaders = (fetchMock: ReturnType<typeof vi.fn>) => {
  const [, init] = fetchMock.mock.calls[0]!;
  return init.headers as Record<string, string>;
};

describe("HttpGithubAppClient.listRepositoryPullRequests", () => {
  let client: HttpGithubAppClient;

  beforeEach(() => {
    client = new HttpGithubAppClient(makeEnv());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("request", () => {
    it("calls the pulls endpoint with state=all and per_page=100", async () => {
      const fetchMock = mockFetchOk([]);

      await client.listRepositoryPullRequests("Test-Owner", "Test-Repo");

      const [url] = fetchMock.mock.calls[0]!;
      expect(String(url)).toBe(
        "https://api.github.com/repos/test-owner/test-repo/pulls?state=all&per_page=100",
      );
    });

    it("sends the required headers", async () => {
      const fetchMock = mockFetchOk([]);

      await client.listRepositoryPullRequests("o", "r");

      const headers = sentHeaders(fetchMock);
      expect(headers["Accept"]).toBe("application/vnd.github+json");
      expect(headers["user-agent"]).toBe("ElWarsha-App");
    });

    it("sends the Authorization header when a token is configured", async () => {
      const fetchMock = mockFetchOk([]);

      await client.listRepositoryPullRequests("o", "r");

      expect(sentHeaders(fetchMock).Authorization).toBe("Bearer fake-github-token");
    });

    it("does not send the Authorization header when there is no token", async () => {
      const fetchMock = mockFetchOk([]);
      const noTokenClient = new HttpGithubAppClient(makeEnv(""));

      await noTokenClient.listRepositoryPullRequests("o", "r");

      expect(sentHeaders(fetchMock).Authorization).toBeUndefined();
    });
  });

  describe("normalization", () => {
    it("maps a GitHub pull request to NormalizedPullRequestSummary", async () => {
      mockFetchOk([rawPr()]);

      const result = await client.listRepositoryPullRequests("test-owner", "test-repo");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        githubPrId: "12345",
        number: 42,
        title: "[week-06] My test PR",
        state: "open",
        authorGithubUserId: "999",
        authorGithubLogin: "eman-dev",
        htmlUrl: "https://github.com/test-owner/test-repo/pull/42",
        mergedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z",
      });
    });

    it('normalizes state to "merged" when merged_at is set', async () => {
      mockFetchOk([rawPr({ state: "closed", merged_at: "2026-01-03T00:00:00Z" })]);

      const [pr] = await client.listRepositoryPullRequests("o", "r");

      expect(pr!.state).toBe("merged");
      expect(pr!.mergedAt).toBe("2026-01-03T00:00:00Z");
    });

    it('keeps state "closed" when the PR was closed without merging', async () => {
      mockFetchOk([rawPr({ state: "closed", merged_at: null })]);

      const [pr] = await client.listRepositoryPullRequests("o", "r");

      expect(pr!.state).toBe("closed");
      expect(pr!.mergedAt).toBeNull();
    });

    it("does not crash when the PR author was deleted (user = null)", async () => {
      mockFetchOk([rawPr({ user: null })]);

      const [pr] = await client.listRepositoryPullRequests("o", "r");

      expect(pr!.authorGithubUserId).toBe("");
      expect(pr!.authorGithubLogin).toBeUndefined();
    });

    it("returns an empty list when the repository has no pull requests", async () => {
      mockFetchOk([]);

      await expect(client.listRepositoryPullRequests("o", "r")).resolves.toEqual([]);
    });
  });

  describe("errors", () => {
    it("throws when GitHub responds with a non-2xx status", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));

      await expect(client.listRepositoryPullRequests("owner", "repo")).rejects.toThrow(
        "GitHub API request failed with status 404",
      );
    });
  });
});
