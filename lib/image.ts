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
