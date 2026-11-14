import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpGithubAppClient } from "./http-github.client.js";

describe("HttpGithubAppClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes pull requests and marks PRs with merged_at as merged", async () => {
    const mockResponse = [
      {
        number: 12,
        title: "[week-06] add form",
        state: "closed",
        merged_at: "2026-11-10T10:00:00Z",
        html_url: "https://github.com/El-Warsha/elwarsha-api/pull/12",
        user: { id: 1001 },
      },
      {
        number: 13,
        title: "[week-06] wip",
        state: "open",
        merged_at: null,
        html_url: "https://github.com/El-Warsha/elwarsha-api/pull/13",
        user: null,
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      }),
    );

    const client = new HttpGithubAppClient("secret-token");
    const result = await client.listRepositoryPullRequests("El-Warsha", "elwarsha-api");

    expect(result).toEqual([
      {
        number: 12,
        title: "[week-06] add form",
        state: "merged",
        htmlUrl: "https://github.com/El-Warsha/elwarsha-api/pull/12",
        authorGithubUserId: "1001",
      },
      {
        number: 13,
        title: "[week-06] wip",
        state: "open",
        htmlUrl: "https://github.com/El-Warsha/elwarsha-api/pull/13",
        authorGithubUserId: "",
      },
    ]);
  });

  it("throws an error when GitHub responds with a non-ok status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      }),
    );

    const client = new HttpGithubAppClient();

    await expect(
      client.listRepositoryPullRequests("El-Warsha", "elwarsha-api"),
    ).rejects.toThrow("GitHub request failed with status 403");
  });
});