import { sign } from "node:crypto";
const header = {
  alg: "RS256",
  typ: "JWT",
};

export function base64UrlEncode(value: string): string {
    return Buffer.from(value).toString("base64url");
}

export function createJwt(appId: string, privateKey: string): string {
    const now = Math.floor(Date.now() / 1000);
const payload = {
    iss: appId,
    iat: now-60,
  exp: now + 600,
}

const encodedHeader = base64UrlEncode(JSON.stringify(header));
const encodedPayload = base64UrlEncode(JSON.stringify(payload));
const data=`${encodedHeader}.${encodedPayload}`;
const signature = sign("RSA-SHA256", Buffer.from(data), privateKey).toString("base64url");
return `${data}.${signature}`;
}