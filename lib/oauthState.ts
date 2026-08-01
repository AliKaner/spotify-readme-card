import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const STATE_TTL_MS = 10 * 60 * 1000;

interface StatePayload {
  userId: string;
  nonce: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.OAUTH_STATE_SECRET;
  if (!secret) throw new Error("Missing OAUTH_STATE_SECRET environment variable.");
  return secret;
}

/**
 * Stateless, HMAC-signed CSRF state for hand-rolled provider OAuth flows
 * (kept outside Convex Auth, which only handles GitHub login). Embeds the
 * logged-in user's id + a short expiry so no server-side state store is
 * needed, and the callback can confirm the same user completed the flow.
 */
export function signState(userId: string): string {
  const payload: StatePayload = {
    userId,
    nonce: randomBytes(16).toString("hex"),
    exp: Date.now() + STATE_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifyState(state: string, expectedUserId: string): boolean {
  const [payloadB64, signature] = state.split(".");
  if (!payloadB64 || !signature) return false;

  const expectedSignature = createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (signatureBuf.length !== expectedBuf.length || !timingSafeEqual(signatureBuf, expectedBuf)) {
    return false;
  }

  let payload: StatePayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return false;
  }

  return payload.exp >= Date.now() && payload.userId === expectedUserId;
}
