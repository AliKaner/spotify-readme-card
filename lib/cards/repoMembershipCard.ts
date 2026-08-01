import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import type { RepoContributionsData } from "./repoContributionsCard";

const WIDTH = 340;
const HEIGHT = 214;
const PADDING = 22;
const STRIPE_Y = 26;
const STRIPE_HEIGHT = 30;

export function buildRepoMembershipCard(data: RepoContributionsData, holderLogin: string, theme: Theme): string {
  const holder = escapeXml(truncateText(holderLogin, 16, WIDTH - PADDING * 2)).toUpperCase();
  const repoName = escapeXml(truncateText(data.fullName, 11, WIDTH - PADDING * 2));
  const memberNo = data.rank ? `NO. ${String(data.rank).padStart(4, "0")}` : `NO. ${String(data.totalContributors).padStart(4, "0")}`;

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Membership card for ${holder} — ${repoName}">
  <title>Membership Card — ${holder} — ${repoName}</title>
  <defs>
    <radialGradient id="memberBg" cx="1" cy="1" r="1">
      <stop offset="0" stop-color="${theme.accent}" stop-opacity="0.3" />
      <stop offset="0.55" stop-color="${theme.background}" stop-opacity="1" />
    </radialGradient>
    <style>
      .brand-title { font: 700 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; letter-spacing: 1.5px; }
      .stripe-label { font: 700 8px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.secondaryText}; letter-spacing: 1px; }
      .commits-value { font: 700 22px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.primaryText}; letter-spacing: 2px; }
      .repo-value { font: 600 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .holder { font: 700 15px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; letter-spacing: 1px; }
      .member-no { font: 600 10px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.secondaryText}; }
    </style>
  </defs>

  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="16" fill="url(#memberBg)" stroke="${theme.border}" />

  <text x="${PADDING}" y="20" class="brand-title">CONTRIBUTOR MEMBERSHIP</text>

  <rect x="0" y="${STRIPE_Y}" width="${WIDTH}" height="${STRIPE_HEIGHT}" fill="#161616" />

  <rect x="${PADDING}" y="${STRIPE_Y + STRIPE_HEIGHT + 20}" width="30" height="22" rx="4" fill="${theme.accent}" fill-opacity="0.7" />
  <line x1="${PADDING}" y1="${STRIPE_Y + STRIPE_HEIGHT + 27}" x2="${PADDING + 30}" y2="${STRIPE_Y + STRIPE_HEIGHT + 27}" stroke="${theme.background}" stroke-width="1" opacity="0.6" />
  <line x1="${PADDING}" y1="${STRIPE_Y + STRIPE_HEIGHT + 34}" x2="${PADDING + 30}" y2="${STRIPE_Y + STRIPE_HEIGHT + 34}" stroke="${theme.background}" stroke-width="1" opacity="0.6" />

  <text x="${PADDING + 40}" y="${STRIPE_Y + STRIPE_HEIGHT + 30}" class="stripe-label">COMMITS ON RECORD</text>
  <text x="${PADDING + 40}" y="${STRIPE_Y + STRIPE_HEIGHT + 50}" class="commits-value">${String(data.contributions).padStart(3, "0")}</text>

  <text x="${WIDTH - PADDING}" y="${STRIPE_Y + STRIPE_HEIGHT + 30}" text-anchor="end" class="stripe-label">REPOSITORY</text>
  <text x="${WIDTH - PADDING}" y="${STRIPE_Y + STRIPE_HEIGHT + 44}" text-anchor="end" class="repo-value">${repoName}</text>

  <text x="${PADDING}" y="${HEIGHT - 32}" class="holder">${holder}</text>
  <text x="${PADDING}" y="${HEIGHT - 16}" class="member-no">MEMBER ${memberNo}</text>
</svg>`;
}
