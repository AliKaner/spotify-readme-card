import type { LanguageCount } from "../github";
import type { Theme } from "../themes";
import { escapeXml } from "../text";
import { appBrandFooter } from "./shared";

const WIDTH = 330;
const PADDING = 16;
const HEADER_HEIGHT = 46;
const ROW_HEIGHT = 34;
const FOOTER_HEIGHT = 38;
const RIGHT_EDGE = WIDTH - PADDING;
const BAR_WIDTH = RIGHT_EDGE - PADDING;
const BAR_HEIGHT = 8;

export function buildTopLanguagesCard(languages: LanguageCount[], theme: Theme): string {
  if (languages.length === 0) return emptyCard(theme);

  const height = HEADER_HEIGHT + languages.length * ROW_HEIGHT + FOOTER_HEIGHT;
  const maxCount = Math.max(...languages.map((l) => l.count));
  const pillLabel = "TOP LANGUAGES";
  const pillWidth = Math.round(pillLabel.length * 7.4 + 44);

  const rows = languages
    .map((l, i) => {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      const fillWidth = Math.max(6, (l.count / maxCount) * BAR_WIDTH);
      return `<g transform="translate(0, ${y})">
    <text x="${PADDING}" y="10" class="lang-label">${escapeXml(l.language)}</text>
    <rect x="${PADDING}" y="16" width="${BAR_WIDTH}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${theme.border}" />
    <rect x="${PADDING}" y="16" width="${fillWidth}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${theme.accent}" />
  </g>`;
    })
    .join("\n  ");

  const footerY = HEADER_HEIGHT + languages.length * ROW_HEIGHT;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Top languages">
  <title>Top Languages</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <style>
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
    .lang-label { font: 600 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
  </style>
  <g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    <text x="12" y="15" class="status">${pillLabel}</text>
  </g>
  ${rows}
  <line x1="${PADDING}" y1="${footerY + 8}" x2="${RIGHT_EDGE}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${appBrandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

function emptyCard(theme: Theme): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No language data available">
  <style>.msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No language data available yet</text>
</svg>`;
}
