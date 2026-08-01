import { escapeXml } from "../text";

export function buildErrorCard(message: string, width = 480, height = 140): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(message)}">
  <rect width="${width}" height="${height}" rx="12" fill="#191414" />
  <text x="${width / 2}" y="${height / 2 + 6}" text-anchor="middle" fill="#b3b3b3" font-family="Segoe UI, sans-serif" font-size="13">${escapeXml(message)}</text>
</svg>`;
}
