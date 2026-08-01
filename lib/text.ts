// Approximate average glyph width for the UI font stack, as a fraction of
// font size. Not pixel-perfect, but close enough to keep truncation stable
// without shipping a font-metrics table.
const AVG_CHAR_WIDTH_RATIO = 0.55;

export function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * AVG_CHAR_WIDTH_RATIO;
}

export function truncateText(text: string, fontSize: number, maxWidth: number): string {
  if (estimateTextWidth(text, fontSize) <= maxWidth) return text;

  let truncated = text;
  while (truncated.length > 1 && estimateTextWidth(`${truncated}…`, fontSize) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
