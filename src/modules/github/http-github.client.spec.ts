import { afterEach, vi } from "vitest";
import type { AppEnv } from "../../config/env.js";
import { HttpGithubAppClient } from "./http-github.client.js";

describe("HttpGithubAppClient", () => {
    const env={
         GITHUB_TOKEN: "test-token",
    }as AppEnv;
    const client = new HttpGithubAppClient(env);
    afterEach(() => {
  vi.restoreAllMocks();
});

it("should send a GET request with the correct URL and headers", async () => {
    const fetchMock = vi.
                spyOn(globalThis, "fetch").
                mockResolvedValue(

                    new Response(JSON.stringify([]), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                    }
                )
            );

       await client.listRepositoryPullRequests("El-warsha", "elwarsha-api"); 
       expect(fetchMock).toHaveBeenCalledWith(
            "https://api.github.com/repos/El-warsha/elwarsha-api/pulls?state=all&per_page=100",
            {
                method: "GET",
                headers: {
                    Accept: "application/vnd.github+json",
                    "User-Agent": "ElWarsha-App",
                 
                  Authorization: "Bearer test-token",
      }} ); 
});

it("should normalize GitHub pull requests correctly", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify([
        {
          id: 6001,
          number: 42,
          title: "[week-06] backend task",
          state: "open",
          user: { id: 1001, login: "ahillah" },
          html_url: "https://github.com/El-warsha/elwarsha-api/pull/42",
          merged_at: null,
          created_at: "2026-11-07T10:00:00Z",
          updated_at: "2026-11-07T10:30:00Z",
        },
        {
          id: 6002,
          number: 43,
          title: "[week-06] another task",
          state: "closed",
          user: { id: 1002, login: "another-user" },
          html_url: "https://github.com/El-warsha/elwarsha-api/pull/43",
          merged_at: "2026-11-08T10:00:00Z",
          created_at: "2026-11-07T11:00:00Z",
          updated_at: "2026-11-08T10:00:00Z",
        },
      ]),
      { status: 200 },
    ),
  );

  const result = await client.listRepositoryPullRequests(
    "El-warsha",
    "elwarsha-api",
  );

  expect(result).toHaveLength(2);

  expect(result[0]).toEqual({
    githubPrId: "6001",
    number: 42,
    title: "[week-06] backend task",
    state: "open",
    authorGithubUserId: "1001",
    authorGithubLogin: "ahillah",
    htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
    mergedAt: null,
    createdAt: "2026-11-07T10:00:00Z",
    updatedAt: "2026-11-07T10:30:00Z",
  });

  expect(result[1].state).toBe("merged");
});

it("should throw an error when GitHub API request fails", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(null, { status: 403 }),
  );

  await expect(
    client.listRepositoryPullRequests("El-warsha", "elwarsha-api"),
  ).rejects.toThrow("GitHub API error: 403");
});
it("should not send Authorization header when token is missing", async () => {
  const clientWithoutToken = new HttpGithubAppClient({} as AppEnv);

  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify([]), { status: 200 }),
  );

  await clientWithoutToken.listRepositoryPullRequests(
    "El-warsha",
    "elwarsha-api",
  );

  expect(fetchMock).toHaveBeenCalledWith(
    "https://api.github.com/repos/El-warsha/elwarsha-api/pulls?state=all&per_page=100",
    {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ElWarsha-App",
      },
    },
  );
});

it("should handle primary rate limit", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(null, {
      status: 403,
      headers: {
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "1794500000",
      },
    }),
  );

  await expect(
    client.listRepositoryPullRequests("El-warsha", "elwarsha-api"),
  ).rejects.toThrow(
    "GitHub primary rate limit exceeded. Retry after timestamp: 1794500000.",
  );
});

it("should handle secondary rate limit", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        message: "You have exceeded a secondary rate limit.",
      }),
      {
        status: 403,
        headers: {
          "Retry-After": "60",
        },
      },
    ),
  );

  await expect(
    client.listRepositoryPullRequests("El-warsha", "elwarsha-api"),
  ).rejects.toThrow(
    "GitHub secondary rate limit exceeded. Retry after 60 seconds.",
  );
});
});