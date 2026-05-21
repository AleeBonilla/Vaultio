import { unauthorized } from "../common/errors";

export interface DemoTokenPayload {
  sub: string;
  email: string;
}

export function createToken(payload: DemoTokenPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function readToken(authorizationHeader?: string): DemoTokenPayload {
  if (!authorizationHeader) unauthorized();
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) unauthorized("Token inválido");

  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as DemoTokenPayload;
    if (!payload.sub || !payload.email) unauthorized("Token inválido");
    return payload;
  } catch {
    unauthorized("Token inválido");
  }
}
