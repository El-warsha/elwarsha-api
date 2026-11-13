import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppEnv } from "../../config/env.js";
import { HttpGithubAppClient } from "./http-github.client.js";

describe("HttpGithubAppClient", () => {
  const baseEnv = {
    GITHUB_TOKEN: "gh-secret-token",
    GITHUB_WEBHOOK_SECRET: "test-secret",
  } as AppEnv;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends required headers and authorization token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpGithubAppClient(baseEnv);
    await client.listRepositoryPullRequests("El-warsha", "elwarsha-api");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/El-warsha/elwarsha-api/pulls?state=all&per_page=100",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/vnd.github+json",
          "User-Agent": "ElWarsha-App",
          Authorization: "Bearer gh-secret-token",
        }),
      }),
    );
  });

  it("omits authorization header when token is not configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpGithubAppClient({
      ...baseEnv,
      GITHUB_TOKEN: "",
    });
    await client.listRepositoryPullRequests("El-warsha", "elwarsha-api");

    const callArgs = fetchMock.mock.calls[0];
    const options = callArgs?.[1] as { headers?: Record<string, string> };
    expect(options?.headers?.Authorization).toBeUndefined();
  });

  it("normalizes pull requests and marks merged_at as merged state", async () => {
    const rawPullRequests = [
      {
        id: 101,
        number: 12,
        title: "[week-06] open runtime sync pr",
        state: "open",
        user: { id: 2001, login: "student1" },
        html_url: "https://github.com/El-warsha/elwarsha-api/pull/12",
        merged_at: null,
        created_at: "2026-11-08T10:00:00Z",
        updated_at: "2026-11-08T11:00:00Z",
      },
      {
        id: 102,
        number: 13,
        title: "[week-01] merged foundation pr",
        state: "closed",
        user: { id: 2002, login: "student2" },
        html_url: "https://github.com/El-warsha/elwarsha-api/pull/13",
        merged_at: "2026-11-08T12:00:00Z",
        created_at: "2026-11-08T09:00:00Z",
        updated_at: "2026-11-08T12:00:00Z",
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => rawPullRequests,
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpGithubAppClient(baseEnv);
    const results = await client.listRepositoryPullRequests("El-warsha", "elwarsha-api");

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      githubPrId: "101",
      number: 12,
      title: "[week-06] open runtime sync pr",
      state: "open",
      authorGithubUserId: "2001",
      authorGithubLogin: "student1",
      htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/12",
      mergedAt: null,
      createdAt: "2026-11-08T10:00:00Z",
      updatedAt: "2026-11-08T11:00:00Z",
    });

    expect(results[1]).toEqual({
      githubPrId: "102",
      number: 13,
      title: "[week-01] merged foundation pr",
      state: "merged",
      authorGithubUserId: "2002",
      authorGithubLogin: "student2",
      htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/13",
      mergedAt: "2026-11-08T12:00:00Z",
      createdAt: "2026-11-08T09:00:00Z",
      updatedAt: "2026-11-08T12:00:00Z",
    });
  });

  it("throws an error when GitHub API response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "rate limit exceeded",
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpGithubAppClient(baseEnv);

    await expect(
      client.listRepositoryPullRequests("El-warsha", "elwarsha-api"),
    ).rejects.toThrow("GitHub API error: 403 rate limit exceeded");
  });
});
