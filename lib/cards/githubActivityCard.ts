import type { GithubActivity } from "../github";
import type { Theme } from "../themes";
import { escapeXml, truncateText, timeAgo } from "../text";
import { appBrandFooter } from "./shared";

const WIDTH = 330;
const PADDING = 16;
const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 54;
const FOOTER_HEIGHT = 42;
const RIGHT_EDGE = WIDTH - PADDING;

export function buildGithubActivityCard(activity: GithubActivity[], theme: Theme): string {
  if (activity.length === 0) return emptyCard(theme);

  const height = HEADER_HEIGHT + activity.length * ROW_HEIGHT + FOOTER_HEIGHT;
  const pillLabel = "RECENT ACTIVITY";
  const pillWidth = Math.round(pillLabel.length * 7.4 + 44);

  const rows = activity
    .map((item, i) => {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      const message = escapeXml(truncateText(item.message, 12, 220));
      const meta = escapeXml(`${item.repo} · ${timeAgo(item.createdAt)}`);
      const isLast = i === activity.length - 1;
      return `<g transform="translate(${PADDING}, ${y})">
    <circle cx="6" cy="6" r="3" fill="${theme.accent}" />
    <text x="18" y="10" class="commit-msg">${message}</text>
    <text x="18" y="28" class="commit-meta">${meta}</text>
    ${!isLast ? `<line x1="0" y1="${ROW_HEIGHT - 6}" x2="${RIGHT_EDGE - PADDING}" y2="${ROW_HEIGHT - 6}" stroke="${theme.border}" stroke-opacity="0.4" />` : ""}
  </g>`;
    })
    .join("\n  ");

  const footerY = HEADER_HEIGHT + activity.length * ROW_HEIGHT;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${pillLabel}">
  <title>${pillLabel}</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <style>
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
    .commit-msg { font: 600 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .commit-meta { font: 400 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
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
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No recent activity">
  <style>.msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No recent public activity</text>
</svg>`;
}
