import { describe, expect, it } from "vitest";

import { hmacSha256 } from "../../common/crypto.js";
import { verifyGithubSignature } from "./github-webhook.verifier.js";

describe("verifyGithubSignature", () => {
  it("accepts a valid GitHub signature", () => {
    const body = '{"action":"opened"}';
    const signature = `sha256=${hmacSha256("webhook-secret", body)}`;
    expect(verifyGithubSignature("webhook-secret", body, signature)).toBe(true);
  });

  it("rejects a missing or malformed signature", () => {
    expect(verifyGithubSignature("webhook-secret", "{}", undefined)).toBe(false);
    expect(verifyGithubSignature("webhook-secret", "{}", "sha1=abc")).toBe(false);
  });
});
