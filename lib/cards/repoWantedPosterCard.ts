import { escapeXml, truncateText } from "../text";
import { thumbShadowFilter } from "./shared";
import type { RepoContributionsData } from "./repoContributionsCard";

const WIDTH = 300;
const HEIGHT = 400;
const PADDING = 20;
const PHOTO_SIZE = 140;

// Fixed "aged paper" palette — a wanted poster should look the same regardless of the
// card's color theme, the same way badge tiers use fixed bronze/silver/gold rather than
// the theme accent.
const PAPER = "#e8d9b5";
const INK = "#3d2817";
const INK_SOFT = "#6b5133";
const STAMP_RED = "#a3392b";

export function buildRepoWantedPosterCard(data: RepoContributionsData, avatar: string | null, holderLogin: string): string {
  const name = escapeXml(truncateText(holderLogin, 22, WIDTH - PADDING * 2).toUpperCase());
  const repoName = escapeXml(truncateText(data.fullName, 11, WIDTH - PADDING * 2));
  const photoY = 118;

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Wanted poster for ${name}">
  <title>Wanted — ${name}</title>
  <defs>
    <clipPath id="wantedPhoto"><rect x="${(WIDTH - PHOTO_SIZE) / 2}" y="${photoY}" width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" /></clipPath>
    <filter id="sepia"><feColorMatrix type="matrix" values="0.55 0.35 0.1 0 0  0.4 0.5 0.1 0 0  0.3 0.3 0.25 0 0  0 0 0 1 0" /></filter>
    ${thumbShadowFilter()}
    <style>
      .wanted { font: 700 34px Georgia, 'Times New Roman', serif; fill: ${INK}; letter-spacing: 6px; }
      .subtitle { font: 700 10px Georgia, 'Times New Roman', serif; fill: ${STAMP_RED}; letter-spacing: 2px; }
      .name { font: 700 17px Georgia, 'Times New Roman', serif; fill: ${INK}; letter-spacing: 1px; }
      .reward-label { font: 700 9px Georgia, 'Times New Roman', serif; fill: ${INK_SOFT}; letter-spacing: 2px; }
      .reward-value { font: 700 26px Georgia, 'Times New Roman', serif; fill: ${STAMP_RED}; }
      .fine-print { font: 400 10px Georgia, 'Times New Roman', serif; fill: ${INK_SOFT}; }
      .brand { font: 700 8px Georgia, 'Times New Roman', serif; fill: ${INK_SOFT}; letter-spacing: 1px; }
    </style>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}" />
  <rect x="10" y="10" width="${WIDTH - 20}" height="${HEIGHT - 20}" fill="none" stroke="${INK}" stroke-width="3" />
  <rect x="15" y="15" width="${WIDTH - 30}" height="${HEIGHT - 30}" fill="none" stroke="${INK}" stroke-width="1" />

  <g>
    <circle cx="26" cy="24" r="6" fill="${STAMP_RED}" /><circle cx="24.5" cy="22.5" r="2" fill="#ffffff" fill-opacity="0.5" />
    <circle cx="${WIDTH - 26}" cy="24" r="6" fill="${STAMP_RED}" /><circle cx="${WIDTH - 27.5}" cy="22.5" r="2" fill="#ffffff" fill-opacity="0.5" />
  </g>

  <text x="${WIDTH / 2}" y="52" text-anchor="middle" class="wanted">WANTED</text>
  <text x="${WIDTH / 2}" y="70" text-anchor="middle" class="subtitle">FOR EXCESSIVE COMMITS</text>

  <g filter="url(#thumbShadow)">
    ${avatar
      ? `<g filter="url(#sepia)"><image href="${avatar}" x="${(WIDTH - PHOTO_SIZE) / 2}" y="${photoY}" width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" clip-path="url(#wantedPhoto)" preserveAspectRatio="xMidYMid slice" /></g>`
      : `<rect x="${(WIDTH - PHOTO_SIZE) / 2}" y="${photoY}" width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" fill="${INK_SOFT}" fill-opacity="0.3" />`}
  </g>
  <rect x="${(WIDTH - PHOTO_SIZE) / 2 + 0.5}" y="${photoY + 0.5}" width="${PHOTO_SIZE - 1}" height="${PHOTO_SIZE - 1}" fill="none" stroke="${INK}" stroke-width="2" />

  <text x="${WIDTH / 2}" y="${photoY + PHOTO_SIZE + 28}" text-anchor="middle" class="name">${name}</text>

  <line x1="${PADDING}" y1="${photoY + PHOTO_SIZE + 40}" x2="${WIDTH - PADDING}" y2="${photoY + PHOTO_SIZE + 40}" stroke="${INK}" stroke-opacity="0.4" />

  <text x="${WIDTH / 2}" y="${photoY + PHOTO_SIZE + 62}" text-anchor="middle" class="reward-label">REWARD</text>
  <text x="${WIDTH / 2}" y="${photoY + PHOTO_SIZE + 90}" text-anchor="middle" class="reward-value">★ ${data.contributions * 10}</text>
  <text x="${WIDTH / 2}" y="${photoY + PHOTO_SIZE + 108}" text-anchor="middle" class="fine-print">${data.contributions} commits to ${repoName}</text>

  <text x="${WIDTH / 2}" y="${HEIGHT - 14}" text-anchor="middle" class="brand">README CARDS · OPEN SOURCE MARSHAL OFFICE</text>
</svg>`;
}
