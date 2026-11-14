import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppEnv } from "../../config/env.js";
import { GithubApiError, HttpGithubAppClient } from "./http-github.client.js";

function createEnv(overrides: Partial<AppEnv> = {}): AppEnv {
  return {
    NODE_ENV: "test",
    PORT: 3001,
    LOG_LEVEL: "info",
    DATABASE_URL: "postgresql://localhost/test",
    WEB_ORIGIN: "http://localhost:5173",
    API_ORIGIN: "http://localhost:3001",
    SESSION_COOKIE_NAME: "elwarsha_session",
    SESSION_SECRET: "test-session-secret",
    SESSION_TTL_SECONDS: 1209600,
    IDENTITY_PROVIDER: "fake",
    AUTH0_DOMAIN: "",
    AUTH0_CLIENT_ID: "",
    AUTH0_CLIENT_SECRET: "",
    AUTH0_AUDIENCE: "",
    GITHUB_APP_ID: "",
    GITHUB_APP_PRIVATE_KEY: "",
    GITHUB_WEBHOOK_SECRET: "test-webhook-secret",
    GITHUB_APP_CLIENT_ID: "",
    GITHUB_APP_CLIENT_SECRET: "",
    GITHUB_TOKEN: "",
    GITHUB_CLIENT_ADAPTER: "http",
    FAKE_USER_GITHUB_ID: "1001",
    ...overrides,
  };
}

function githubPullRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: 6001,
    number: 42,
    title: "[week-06] implement github runtime sync",
    state: "open",
    merged_at: null,
    html_url: "https://github.com/El-warsha/elwarsha-api/pull/42",
    created_at: "2026-11-07T10:00:00.000Z",
    updated_at: "2026-11-07T10:30:00.000Z",
    user: { id: 1001, login: "test-participant" },
    ...overrides,
  };
}

describe("HttpGithubAppClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests repository pull requests with the required headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([githubPullRequest()]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpGithubAppClient(createEnv({ GITHUB_TOKEN: "secret-token" }));
    await client.listRepositoryPullRequests("El-warsha", "elwarsha-api");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/El-warsha/elwarsha-api/pulls?state=all&per_page=100",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "ElWarsha-App",
          Authorization: "Bearer secret-token",
        },
      },
    );
  });

  it("omits the Authorization header when no token is configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpGithubAppClient(createEnv());
    await client.listRepositoryPullRequests("El-warsha", "elwarsha-web");

    const init = fetchMock.mock.calls[0][1] as { headers: Record<string, string> };
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("normalizes pull request summaries and promotes merged PRs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          githubPullRequest(),
          githubPullRequest({
            id: 1001,
            number: 1,
            title: "[week-01] open the first PR",
            state: "closed",
            merged_at: "2026-10-05T12:00:00.000Z",
            html_url: "https://github.com/El-warsha/elwarsha-api/pull/1",
          }),
          githubPullRequest({
            id: 7001,
            number: 50,
            title: "chore: close old work",
            state: "closed",
            merged_at: null,
            user: null,
          }),
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpGithubAppClient(createEnv());
    const result = await client.listRepositoryPullRequests("El-warsha", "elwarsha-api");

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      githubPrId: "6001",
      number: 42,
      title: "[week-06] implement github runtime sync",
      state: "open",
      authorGithubUserId: "1001",
      authorGithubLogin: "test-participant",
      htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
      mergedAt: null,
    });
    expect(result[1].state).toBe("merged");
    expect(result[2]).toMatchObject({
      state: "closed",
      authorGithubUserId: "",
    });
    expect(result[2].authorGithubLogin).toBeUndefined();
  });

  it("throws a GithubApiError with rate-limit details on 403 responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
        status: 403,
        headers: {
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": "1762531200",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpGithubAppClient(createEnv());

    await expect(
      client.listRepositoryPullRequests("El-warsha", "elwarsha-api"),
    ).rejects.toMatchObject({
      name: "GithubApiError",
      status: 403,
      rateLimitReset: "1762531200",
    });
    await expect(
      client.listRepositoryPullRequests("El-warsha", "elwarsha-api"),
    ).rejects.toThrow(/rate limit/i);
  });

  it("throws a GithubApiError for other failed responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "Not Found" }), { status: 404 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpGithubAppClient(createEnv());

    await expect(
      client.listRepositoryPullRequests("El-warsha", "missing"),
    ).rejects.toBeInstanceOf(GithubApiError);
  });

  it("loads a single pull request and normalizes its state", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify(
          githubPullRequest({
            state: "closed",
            merged_at: "2026-11-08T09:00:00.000Z",
          }),
        ),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new HttpGithubAppClient(createEnv());
    const result = await client.getPullRequest("El-warsha", "elwarsha-api", 42);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/El-warsha/elwarsha-api/pulls/42",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(result).toMatchObject({
      githubPrId: "6001",
      number: 42,
      state: "merged",
      approvalCount: 0,
      checksPassed: false,
    });
  });
});
