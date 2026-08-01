import type { GithubRepo } from "../github";
import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appBrandFooter } from "./shared";

const WIDTH = 330;
const PADDING = 16;
const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 54;
const FOOTER_HEIGHT = 42;
const RIGHT_EDGE = WIDTH - PADDING;

export function buildGithubReposCard(repos: GithubRepo[], theme: Theme): string {
  if (repos.length === 0) return emptyCard(theme);

  const height = HEADER_HEIGHT + repos.length * ROW_HEIGHT + FOOTER_HEIGHT;
  const pillLabel = "TOP REPOSITORIES";
  const pillWidth = Math.min(Math.round(pillLabel.length * 7.4 + 44), WIDTH - PADDING * 2);

  const rows = repos
    .map((repo, i) => {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      const name = escapeXml(truncateText(repo.name, 13, 220));
      const desc = escapeXml(truncateText(repo.description ?? repo.language ?? "", 11, 200));
      const isLast = i === repos.length - 1;
      return `<g transform="translate(0, ${y})">
    <text x="${PADDING}" y="16" class="repo-name">${name}</text>
    <g transform="translate(${RIGHT_EDGE - 34}, 4)">
      ${starIcon(theme.accent)}
      <text x="18" y="11" class="repo-stars">${repo.stars}</text>
    </g>
    <text x="${PADDING}" y="34" class="repo-desc">${desc}</text>
    ${!isLast ? `<line x1="${PADDING}" y1="${ROW_HEIGHT - 6}" x2="${RIGHT_EDGE}" y2="${ROW_HEIGHT - 6}" stroke="${theme.border}" stroke-opacity="0.4" />` : ""}
  </g>`;
    })
    .join("\n  ");

  const footerY = HEADER_HEIGHT + repos.length * ROW_HEIGHT;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${pillLabel}">
  <title>${pillLabel}</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <style>
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
    .repo-name { font: 600 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .repo-desc { font: 400 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
    .repo-stars { font: 600 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
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

function starIcon(accent: string): string {
  return `<path d="M6 0l1.6 3.5L11 4l-2.5 2.6L9 10 6 8 3 10l0.5-3.4L1 4l3.4-0.5z" fill="${accent}" />`;
}

function emptyCard(theme: Theme): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No repositories available">
  <style>.msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No repositories available yet</text>
</svg>`;
}
