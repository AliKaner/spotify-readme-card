/**
 * Album art must be inlined as a data URI: GitHub's camo proxy re-hosts
 * <img> content but a nested <image href="https://..."> inside our SVG
 * would otherwise leak the original Spotify CDN URL and can get stripped.
 */
export async function toDataUri(url?: string): Promise<string | null> {
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./, // link-local, incl. cloud metadata services
  /^\[?::1\]?$/,
  /^\[?fe80:/i,
];

/**
 * Same as `toDataUri`, but for URLs a user typed in themselves (gallery/product images
 * on custom cards) rather than ones we control (Spotify's own CDN). Rejects obvious
 * private/loopback/link-local hosts first as a lightweight SSRF guard — not a full
 * DNS-rebinding-proof solution, but stops the trivial cases for a low-stakes feature.
 */
export async function toDataUriUntrusted(url?: string): Promise<string | null> {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;
  if (BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) return null;

  return toDataUri(url);
}
