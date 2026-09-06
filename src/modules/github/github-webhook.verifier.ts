import { hmacSha256, safeEqual } from "../../common/crypto.js";

export function verifyGithubSignature(
  secret: string,
  rawBody: string,
  signatureHeader: string | undefined,
): boolean {
  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expected = `sha256=${hmacSha256(secret, rawBody)}`;
  return safeEqual(expected, signatureHeader);
}
