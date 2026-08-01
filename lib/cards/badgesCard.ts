import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { spotifyGlyph } from "./shared";
import type { Badge, BadgeIcon, BadgeTier } from "../badges";

const WIDTH = 330;
const PADDING = 16;
const COLUMNS = 3;
const HEADER_HEIGHT = 46;
const FOOTER_HEIGHT = 34;
const GAP = 12;

const MONO_FONT = "'Cascadia Code', 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace";

const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: "#cd8a4d",
  silver: "#c8ccd4",
  gold: "#f4c542",
};

export function buildBadgesCard(badges: Badge[], theme: Theme, totalCount?: number): string {
  if (badges.length === 0) return emptyCard(theme);

  const shown = badges.slice(0, 9);
  const columns = Math.min(COLUMNS, shown.length);
  const rows = Math.ceil(shown.length / columns);
  const cellSize = (WIDTH - PADDING * 2 - GAP * (columns - 1)) / columns;
  const cellHeight = cellSize + 24;
  const gridHeight = rows * cellHeight + (rows - 1) * GAP;
  const height = HEADER_HEIGHT + gridHeight + FOOTER_HEIGHT;

  const cells = shown
    .map((badge, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = PADDING + col * (cellSize + GAP);
      const y = HEADER_HEIGHT + row * (cellHeight + GAP);
      const ringColor = badge.tier ? TIER_COLORS[badge.tier] : theme.accent;
      const label = escapeXml(truncateText(badge.label, 9, cellSize + 8)).toUpperCase();
      const sourceMark =
        badge.source === "github"
          ? `<g transform="translate(${cellSize - 15}, 3) scale(0.6)">${githubMark(ringColor)}</g>`
          : `<g transform="translate(${cellSize - 16}, 4) scale(0.72)">${spotifyGlyph(ringColor, theme.background)}</g>`;

      return `<g transform="translate(${x}, ${y})">
    <rect width="${cellSize}" height="${cellSize}" rx="14" fill="${ringColor}" fill-opacity="0.13" />
    <rect x="0.5" y="0.5" width="${cellSize - 1}" height="${cellSize - 1}" rx="14" fill="none" stroke="${ringColor}" stroke-opacity="0.55" />
    <g transform="translate(${cellSize / 2 - 10}, ${cellSize / 2 - 14})">${badgeIcon(badge.icon, ringColor)}</g>
    ${sourceMark}
    <text x="${cellSize / 2}" y="${cellSize + 17}" text-anchor="middle" class="badge-label">${label}</text>
  </g>`;
    })
    .join("\n  ");

  const footerY = HEADER_HEIGHT + gridHeight;
  const pillLabel = "ACHIEVEMENTS";
  const pillWidth = Math.round(pillLabel.length * 6.6 + 40);
  const countLabel = totalCount != null ? `${badges.length}/${totalCount} UNLOCKED` : null;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Achievements">
  <title>Achievements</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <style>
    .status { font: 700 10px ${MONO_FONT}; fill: ${theme.accent}; letter-spacing: 1px; }
    .count { font: 700 10px ${MONO_FONT}; fill: ${theme.secondaryText}; letter-spacing: 0.6px; }
    .badge-label { font: 700 8.5px ${MONO_FONT}; fill: ${theme.primaryText}; letter-spacing: 0.3px; }
    .brand { font: 600 9px ${MONO_FONT}; fill: ${theme.secondaryText}; letter-spacing: 1px; }
  </style>
  <g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    <text x="12" y="15" class="status">${pillLabel}</text>
  </g>
  ${countLabel ? `<text x="${WIDTH - PADDING}" y="31" text-anchor="end" class="count">${countLabel}</text>` : ""}
  ${cells}
  <line x1="${PADDING}" y1="${footerY + 6}" x2="${WIDTH - PADDING}" y2="${footerY + 6}" stroke="${theme.border}" stroke-opacity="0.6" />
  <text x="${PADDING}" y="${footerY + 24}" class="brand">README CARDS</text>
</svg>`;
}

/** Simplified, original glyph — not a reproduction of GitHub's actual logo artwork. */
function githubMark(color: string): string {
  return `<circle cx="9" cy="10" r="7.5" fill="${color}" />
    <path d="M4.8 5.2c0-2 1.6-3.6 3.6-3.6M13.2 5.2c0-2-1.6-3.6-3.6-3.6" stroke="${color}" stroke-width="1.8" stroke-linecap="round" fill="none" />`;
}

function badgeIcon(icon: BadgeIcon, accent: string): string {
  const stroke = `stroke="${accent}" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (icon) {
    case "star":
      // Precise 10-point star polygon (outer r=9, inner r=3.5, centered on 10,10) — no
      // freehand bezier math, so it's guaranteed closed and centered.
      return `<path d="M10 1 12.1 7.2 18.6 7.2 13.3 11.1 15.3 17.3 10 13.5 4.7 17.3 6.7 11.1 1.4 7.2 7.9 7.2Z" fill="${accent}" />`;
    case "trophy":
      return `<path d="M6 3h8v5a4 4 0 01-8 0V3z" fill="${accent}" />
        <rect x="9" y="12" width="2" height="3" fill="${accent}" />
        <rect x="6.5" y="15" width="7" height="2" rx="1" fill="${accent}" />
        <path d="M6 4.5H3v2a3 3 0 003 3M14 4.5h3v2a3 3 0 01-3 3" ${stroke} />`;
    case "moon":
      // Lucide's verified "moon" crescent path, rescaled from a 24x24 to a 20x20 box.
      return `<path d="M17.5 10.66A7.5 7.5 0 1 1 9.34 2.5 5.83 5.83 0 0 0 17.5 10.66Z" fill="${accent}" />`;
    case "repeat":
      // Lucide's verified "repeat" glyph, rescaled from a 24x24 to a 20x20 box.
      return `<path d="M14.17 1.67 17.5 5l-3.33 3.33" ${stroke} /><path d="M2.5 9.17v-.83a3.33 3.33 0 0 1 3.33-3.34h11.67" ${stroke} />
        <path d="M5.83 18.33 2.5 15l3.33-3.33" ${stroke} /><path d="M17.5 10.83v.84a3.33 3.33 0 0 1-3.33 3.33H2.5" ${stroke} />`;
    case "globe":
      return `<circle cx="10" cy="10" r="8" ${stroke} /><ellipse cx="10" cy="10" rx="3.4" ry="8" ${stroke} />
        <line x1="2" y1="10" x2="18" y2="10" ${stroke} />`;
    case "book":
      return `<path d="M4 4c1.6-1 3.6-1 6 0v12c-2.4-1-4.4-1-6 0z" ${stroke} />
        <path d="M16 4c-1.6-1-3.6-1-6 0v12c2.4-1 4.4-1 6 0z" ${stroke} />`;
    case "users":
      return `<circle cx="10" cy="6.5" r="3.5" fill="${accent}" />
        <path d="M2.5 19c0-4.7 3.4-8.5 7.5-8.5s7.5 3.8 7.5 8.5z" fill="${accent}" />`;
    case "calendar":
      return `<rect x="2" y="4" width="16" height="15" rx="2" ${stroke} /><line x1="2" y1="9" x2="18" y2="9" ${stroke} />
        <line x1="6.5" y1="1.5" x2="6.5" y2="6" ${stroke} /><line x1="13.5" y1="1.5" x2="13.5" y2="6" ${stroke} />
        <path d="M6.5 13l1.4 1.4 2.6-2.6" stroke="${accent}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
    case "code":
      return `<path d="M7 5 1 10l6 5M13 5l6 5-6 5" ${stroke} /><line x1="12.8" y1="3" x2="10.2" y2="19" ${stroke} />`;
    default:
      return `<circle cx="10" cy="10" r="8" fill="${accent}" />`;
  }
}

function emptyCard(theme: Theme): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No achievements yet">
  <style>.msg { font: 500 13px ${MONO_FONT}; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No achievements unlocked yet</text>
</svg>`;
}
