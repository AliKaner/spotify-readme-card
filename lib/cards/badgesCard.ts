import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appBrandFooter } from "./shared";
import type { Badge, BadgeIcon } from "../badges";

const WIDTH = 330;
const PADDING = 16;
const COLUMNS = 3;
const HEADER_HEIGHT = 46;
const FOOTER_HEIGHT = 38;
const GAP = 12;

export function buildBadgesCard(badges: Badge[], theme: Theme): string {
  if (badges.length === 0) return emptyCard(theme);

  const shown = badges.slice(0, 9);
  const columns = Math.min(COLUMNS, shown.length);
  const rows = Math.ceil(shown.length / columns);
  const cellSize = (WIDTH - PADDING * 2 - GAP * (columns - 1)) / columns;
  const cellHeight = cellSize + 22;
  const gridHeight = rows * cellHeight + (rows - 1) * GAP;
  const height = HEADER_HEIGHT + gridHeight + FOOTER_HEIGHT;

  const cells = shown
    .map((badge, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = PADDING + col * (cellSize + GAP);
      const y = HEADER_HEIGHT + row * (cellHeight + GAP);
      const label = escapeXml(truncateText(badge.label, 9, cellSize + 8));
      return `<g transform="translate(${x}, ${y})">
    <rect width="${cellSize}" height="${cellSize}" rx="14" fill="${theme.accent}" fill-opacity="0.14" />
    <rect x="0.5" y="0.5" width="${cellSize - 1}" height="${cellSize - 1}" rx="14" fill="none" stroke="${theme.accent}" stroke-opacity="0.3" />
    <g transform="translate(${cellSize / 2 - 10}, ${cellSize / 2 - 14})">${badgeIcon(badge.icon, theme.accent)}</g>
    <text x="${cellSize / 2}" y="${cellSize + 16}" text-anchor="middle" class="badge-label">${label}</text>
  </g>`;
    })
    .join("\n  ");

  const footerY = HEADER_HEIGHT + gridHeight;
  const pillLabel = "ACHIEVEMENTS";
  const pillWidth = Math.round(pillLabel.length * 7.4 + 44);

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Achievements">
  <title>Achievements</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <style>
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
    .badge-label { font: 600 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
  </style>
  <g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    <text x="12" y="15" class="status">${pillLabel}</text>
  </g>
  ${cells}
  <line x1="${PADDING}" y1="${footerY + 8}" x2="${WIDTH - PADDING}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${appBrandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

function badgeIcon(icon: BadgeIcon, accent: string): string {
  const stroke = `stroke="${accent}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (icon) {
    case "star":
      return `<path d="M10 1l2.6 5.9L19 8l-4.5 4.3L15.8 19 10 15.6 4.2 19l1.3-6.7L1 8l6.4-1.1z" fill="${accent}" />`;
    case "trophy":
      return `<path d="M5 3h10v3a5 5 0 01-10 0V3z" ${stroke} /><path d="M8 11.5v3h4v-3" ${stroke} /><path d="M6 4H3v2a3 3 0 003 3M14 4h3v2a3 3 0 01-3 3" ${stroke} />`;
    case "flame":
      return `<path d="M10 1c2 3-3 4-1 8 1 2 3 1 3 3a3 3 0 01-6 0c0-4 4-3 4-11z" fill="${accent}" />`;
    case "moon":
      return `<path d="M13.5 2.5a8 8 0 100 15 8 8 0 01-7-8 8 8 0 017-7z" fill="${accent}" />`;
    case "repeat":
      return `<path d="M4 8a6 6 0 0110-4.5" ${stroke} /><path d="M16 12a6 6 0 01-10 4.5" ${stroke} /><path d="M14 1.5V4h2.5M6 18.5V16H3.5" ${stroke} />`;
    case "globe":
      return `<circle cx="10" cy="10" r="8" ${stroke} /><ellipse cx="10" cy="10" rx="3.4" ry="8" ${stroke} /><line x1="2" y1="10" x2="18" y2="10" ${stroke} />`;
    case "book":
      return `<rect x="3" y="2" width="14" height="16" rx="2" ${stroke} /><line x1="10" y1="2" x2="10" y2="18" ${stroke} />`;
    case "users":
      return `<circle cx="7" cy="7" r="3" fill="${accent}" /><circle cx="14.5" cy="8.5" r="2.3" fill="${accent}" opacity="0.6" /><path d="M2 18c0-3 2.2-5 5-5s5 2 5 5" ${stroke} /><path d="M12.5 18c0-2.5 1.5-4 4-4" ${stroke} />`;
    case "calendar":
      return `<rect x="2" y="4" width="16" height="14" rx="2" ${stroke} /><line x1="2" y1="8" x2="18" y2="8" ${stroke} /><line x1="6" y1="2" x2="6" y2="6" ${stroke} /><line x1="14" y1="2" x2="14" y2="6" ${stroke} />`;
    case "code":
      return `<path d="M7 5L2 10l5 5M13 5l5 5-5 5" ${stroke} />`;
    default:
      return `<circle cx="10" cy="10" r="7" fill="${accent}" />`;
  }
}

function emptyCard(theme: Theme): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No achievements yet">
  <style>.msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No achievements unlocked yet</text>
</svg>`;
}
