import type { Theme } from "../themes";
import { appBrandFooter } from "./shared";
import type { GithubProfile } from "../github";

const WIDTH = 330;
const PADDING = 16;
const HEADER_HEIGHT = 46;
const ROW_HEIGHT = 34;
const STAT_HEIGHT = 44;
const FOOTER_HEIGHT = 38;
const RIGHT_EDGE = WIDTH - PADDING;
const BAR_WIDTH = RIGHT_EDGE - PADDING;
const BAR_HEIGHT = 8;

export function buildGithubStatsCard(profile: GithubProfile | null, theme: Theme): string {
  if (!profile) return emptyCard(theme);

  const metrics = [
    { label: "Repositories", value: Math.min(profile.publicRepos / 100, 1), raw: profile.publicRepos },
    { label: "Followers", value: Math.min(profile.followers / 500, 1), raw: profile.followers },
    { label: "Gists", value: Math.min(profile.publicGists / 20, 1), raw: profile.publicGists },
  ];

  const height = HEADER_HEIGHT + metrics.length * ROW_HEIGHT + STAT_HEIGHT + FOOTER_HEIGHT;
  const pillLabel = "GITHUB STATS";
  const pillWidth = Math.round(pillLabel.length * 7.4 + 44);

  const rows = metrics
    .map((m, i) => {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      const fillWidth = Math.max(6, m.value * BAR_WIDTH);
      return `<g transform="translate(0, ${y})">
    <text x="${PADDING}" y="10" class="metric-label">${m.label}</text>
    <text x="${RIGHT_EDGE}" y="10" text-anchor="end" class="metric-count">${m.raw}</text>
    <rect x="${PADDING}" y="16" width="${BAR_WIDTH}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${theme.border}" />
    <rect x="${PADDING}" y="16" width="${fillWidth}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${theme.accent}" />
  </g>`;
    })
    .join("\n  ");

  const statY = HEADER_HEIGHT + metrics.length * ROW_HEIGHT;
  const years = Math.max(0, Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000)));
  const footerY = statY + STAT_HEIGHT;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub stats for ${profile.login}">
  <title>GitHub Stats — ${profile.login}</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <style>
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
    .metric-label { font: 600 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .metric-count { font: 600 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
    .stat-value { font: 700 20px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; }
    .stat-label { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
    .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
  </style>
  <g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    <text x="12" y="15" class="status">${pillLabel}</text>
  </g>
  ${rows}
  <text x="${PADDING}" y="${statY + 28}"><tspan class="stat-value">${years}</tspan><tspan class="stat-label" dx="6">YEARS ON GITHUB</tspan></text>
  <line x1="${PADDING}" y1="${footerY + 8}" x2="${RIGHT_EDGE}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${appBrandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

function emptyCard(theme: Theme): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No GitHub profile available">
  <style>.msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No GitHub profile available</text>
</svg>`;
}
