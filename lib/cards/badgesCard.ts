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
    <g transform="translate(${cellSize / 2 - 11}, ${cellSize / 2 - 15})">${badgeIcon(badge.icon, ringColor)}</g>
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
      return `<path d="M11 1.5l3 6.3 6.9.9-5 4.9 1.2 6.9-6.1-3.3-6.1 3.3 1.2-6.9-5-4.9 6.9-.9z" fill="${accent}" />`;
    case "trophy":
      return `<path d="M5 3h12v3.5a6 6 0 01-12 0V3z" ${stroke} /><path d="M8.5 12.5v3.5h5v-3.5" ${stroke} />
        <path d="M4 12h14" ${stroke} /><path d="M5 4.5H1.5v2A3.5 3.5 0 005 10M17 4.5h3.5v2A3.5 3.5 0 0117 10" ${stroke} />`;
    case "moon":
      return `<path d="M15 2.8A9 9 0 106 20.8 9 9 0 0015 18a7.5 7.5 0 01-6.3-7.4A7.5 7.5 0 0115 2.8z" fill="${accent}" />
        <circle cx="16.5" cy="6" r="1" fill="${accent}" /><circle cx="18.5" cy="9.5" r="0.6" fill="${accent}" />`;
    case "repeat":
      return `<path d="M4.5 9a6.5 6.5 0 0111-4.6" ${stroke} /><path d="M4.5 4.4v4.6h4.6" ${stroke} />
        <path d="M17.5 13a6.5 6.5 0 01-11 4.6" ${stroke} /><path d="M17.5 17.6V13h-4.6" ${stroke} />`;
    case "globe":
      return `<circle cx="11" cy="11" r="9" ${stroke} /><ellipse cx="11" cy="11" rx="3.8" ry="9" ${stroke} />
        <line x1="2" y1="11" x2="20" y2="11" ${stroke} /><path d="M3.5 6.5h15M3.5 15.5h15" stroke="${accent}" stroke-width="1.1" fill="none" opacity="0.6" />`;
    case "book":
      return `<path d="M4 4.5c1.8-1 4.4-1 7 0v13c-2.6-1-5.2-1-7 0z" ${stroke} />
        <path d="M18 4.5c-1.8-1-4.4-1-7 0v13c2.6-1 5.2-1 7 0z" ${stroke} />`;
    case "users":
      return `<circle cx="7.5" cy="7" r="3.4" fill="${accent}" /><circle cx="15.5" cy="8.5" r="2.6" fill="${accent}" opacity="0.55" />
        <path d="M2 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" ${stroke} /><path d="M14 20c0-3-1.7-5-4-5.4" ${stroke} />`;
    case "calendar":
      return `<rect x="2.5" y="4.5" width="17" height="15.5" rx="2.5" ${stroke} /><line x1="2.5" y1="9" x2="19.5" y2="9" ${stroke} />
        <line x1="7" y1="2" x2="7" y2="6.5" ${stroke} /><line x1="15" y1="2" x2="15" y2="6.5" ${stroke} />
        <path d="M6.5 13l1.4 1.4L10.5 11.8" stroke="${accent}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
    case "code":
      return `<path d="M7.5 5.5L1.5 11l6 5.5M15.5 5.5l6 5.5-6 5.5" ${stroke} /><line x1="12.8" y1="3" x2="10.2" y2="19" ${stroke} />`;
    default:
      return `<circle cx="11" cy="11" r="8" fill="${accent}" />`;
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
