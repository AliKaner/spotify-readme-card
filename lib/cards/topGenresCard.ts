import type { GenreCount } from "../spotify";
import type { Theme } from "../themes";
import { escapeXml } from "../text";
import { brandFooter } from "./shared";

const WIDTH = 330;
const PADDING = 16;
const HEADER_HEIGHT = 46;
const ROW_HEIGHT = 34;
const FOOTER_HEIGHT = 38;
const RADIUS = 18;
const RIGHT_EDGE = WIDTH - PADDING;
const BAR_WIDTH = RIGHT_EDGE - PADDING;
const BAR_HEIGHT = 8;

export function buildTopGenresCard(genres: GenreCount[], theme: Theme): string {
  if (genres.length === 0) return buildEmptyCard(theme);

  const height = HEADER_HEIGHT + genres.length * ROW_HEIGHT + FOOTER_HEIGHT;
  const maxCount = Math.max(...genres.map((g) => g.count));
  const pillLabel = "TOP GENRES";
  const pillWidth = Math.round(pillLabel.length * 7.4 + 44);

  const rows = genres
    .map((g, i) => {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      const label = escapeXml(g.genre);
      const fillWidth = Math.max(6, (g.count / maxCount) * BAR_WIDTH);
      return `<g transform="translate(0, ${y})">
    <text x="${PADDING}" y="10" class="genre-label">${label}</text>
    <rect x="${PADDING}" y="16" width="${BAR_WIDTH}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${theme.border}" />
    <rect x="${PADDING}" y="16" width="${fillWidth}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${theme.accent}" />
  </g>`;
    })
    .join("\n  ");

  const footerY = HEADER_HEIGHT + genres.length * ROW_HEIGHT;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Top genres">
  <title>Top Genres</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="${RADIUS}" fill="${theme.background}" stroke="${theme.border}" />
  <style>
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
    .genre-label { font: 600 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; text-transform: capitalize; }
    .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
  </style>

  <g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    ${genreIcon(theme.accent)}
    <text x="26" y="15" class="status">${pillLabel}</text>
  </g>

  ${rows}

  <line x1="${PADDING}" y1="${footerY + 8}" x2="${RIGHT_EDGE}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${brandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

function genreIcon(accent: string): string {
  return `<g transform="translate(11, 6)">
    <path d="M0.5 5.5 5.5 0.5h4l1 1v4l-5 5-5-5z" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linejoin="round" />
    <circle cx="7.7" cy="2.3" r="1" fill="${accent}" />
  </g>`;
}

function buildEmptyCard(theme: Theme): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No genre data available">
  <style>
    .msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="${RADIUS}" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No genre data available yet</text>
</svg>`;
}
