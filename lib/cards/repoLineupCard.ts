import { escapeXml, truncateText } from "../text";
import { thumbShadowFilter } from "./shared";
import type { RepoContributionsData } from "./repoContributionsCard";

const WIDTH = 480;
const HEIGHT = 220;
const PADDING = 20;
const PHOTO_WIDTH = 170;
const PHOTO_Y = 20;
const PHOTO_HEIGHT = 150;
const FIELD_X = PADDING + PHOTO_WIDTH + 24;

// Fixed "police case file" palette — a noir mugshot backdrop should look the same
// regardless of the card's color theme, same rationale as the wanted poster's paper tone.
const BG = "#151515";
const PANEL = "#1f1f1f";
const CHART_LINE = "#5b7a99";
const TEXT_LIGHT = "#e5e5e5";
const TEXT_MUTED = "#9a9a9a";
const STAMP_RED = "#b23b3b";

export function buildRepoLineupCard(data: RepoContributionsData, avatar: string | null, holderLogin: string): string {
  const alias = escapeXml(truncateText(holderLogin, 14, WIDTH - FIELD_X - PADDING));
  const repoName = escapeXml(truncateText(data.fullName, 13, WIDTH - FIELD_X - PADDING));
  const rankLabel = data.rank ? `#${data.rank} of ${data.totalContributors}` : `${data.totalContributors} total`;
  const caseNumber = String(data.contributions).padStart(6, "0");

  const heightMarks = [190, 180, 170, 160, 150];
  const rulerLines = heightMarks
    .map((cm, i) => {
      const y = PHOTO_Y + (i / (heightMarks.length - 1)) * (PHOTO_HEIGHT - 20) + 10;
      return `<line x1="${PADDING}" y1="${y}" x2="${PADDING + PHOTO_WIDTH}" y2="${y}" stroke="${CHART_LINE}" stroke-opacity="0.5" stroke-width="1" />
    <text x="${PADDING + PHOTO_WIDTH - 4}" y="${y - 3}" text-anchor="end" class="ruler">${cm}</text>`;
    })
    .join("\n    ");

  const fields = [
    { label: "KNOWN ALIASES", value: alias },
    { label: "LAST SEEN AT", value: repoName },
    { label: "COMMITS ON RECORD", value: String(data.contributions) },
    { label: "STANDING", value: rankLabel },
  ];
  const fieldRows = fields
    .map((f, i) => {
      const y = PHOTO_Y + 14 + i * 32;
      return `<text x="${FIELD_X}" y="${y}" class="field-label">${f.label}</text>
    <text x="${FIELD_X}" y="${y + 17}" class="field-value">${escapeXml(truncateText(f.value, 13, WIDTH - FIELD_X - PADDING))}</text>`;
    })
    .join("\n    ");

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Case file for ${alias} — ${repoName}">
  <title>Case File — ${alias} — ${repoName}</title>
  <defs>
    <clipPath id="lineupPhoto"><rect x="${PADDING}" y="${PHOTO_Y}" width="${PHOTO_WIDTH}" height="${PHOTO_HEIGHT}" /></clipPath>
    <filter id="mono"><feColorMatrix type="saturate" values="0.15" /></filter>
    ${thumbShadowFilter()}
    <style>
      .ruler { font: 600 8px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${CHART_LINE}; }
      .case-label { font: 700 9px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${TEXT_MUTED}; letter-spacing: 1px; }
      .case-value { font: 700 11px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${TEXT_LIGHT}; }
      .field-label { font: 700 9px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${TEXT_MUTED}; letter-spacing: 1px; }
      .field-value { font: 700 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${TEXT_LIGHT}; }
      .stamp { font: 700 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${STAMP_RED}; letter-spacing: 2px; }
      .brand { font: 600 8px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${TEXT_MUTED}; letter-spacing: 1px; }
    </style>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" rx="10" fill="${BG}" />
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="10" fill="none" stroke="${PANEL}" />

  <g filter="url(#thumbShadow)">
    ${avatar
      ? `<g filter="url(#mono)"><image href="${avatar}" x="${PADDING}" y="${PHOTO_Y}" width="${PHOTO_WIDTH}" height="${PHOTO_HEIGHT}" clip-path="url(#lineupPhoto)" preserveAspectRatio="xMidYMid slice" /></g>`
      : `<rect x="${PADDING}" y="${PHOTO_Y}" width="${PHOTO_WIDTH}" height="${PHOTO_HEIGHT}" fill="${PANEL}" />`}
  </g>
  ${rulerLines}
  <rect x="${PADDING + 0.5}" y="${PHOTO_Y + 0.5}" width="${PHOTO_WIDTH - 1}" height="${PHOTO_HEIGHT - 1}" fill="none" stroke="${CHART_LINE}" stroke-opacity="0.6" />

  <rect x="${PADDING}" y="${PHOTO_Y + PHOTO_HEIGHT + 8}" width="${PHOTO_WIDTH}" height="20" fill="${PANEL}" />
  <text x="${PADDING + 8}" y="${PHOTO_Y + PHOTO_HEIGHT + 22}" class="case-label">CASE</text>
  <text x="${PADDING + PHOTO_WIDTH - 8}" y="${PHOTO_Y + PHOTO_HEIGHT + 22}" text-anchor="end" class="case-value">${caseNumber}</text>

  ${fieldRows}

  <text x="${WIDTH - PADDING}" y="${HEIGHT - 14}" text-anchor="end" class="stamp" transform="rotate(-6 ${WIDTH - 70} ${HEIGHT - 20})">ON FILE</text>
  <text x="${PADDING}" y="${HEIGHT - 12}" class="brand">README CARDS · OPEN SOURCE RECORDS DIVISION</text>
</svg>`;
}
