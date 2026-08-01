import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appGlyph, thumbShadowFilter, barcode } from "./shared";
import type { RepoContributionsData } from "./repoContributionsCard";

const WIDTH = 480;
const HEIGHT = 280;
const PADDING = 20;
const PHOTO_SIZE = 96;
const PHOTO_X = PADDING;
const PHOTO_Y = 64;
const FIELD_X = PHOTO_X + PHOTO_SIZE + 26;

function stamp(cx: number, cy: number, color: string): string {
  return `<g transform="translate(${cx}, ${cy}) rotate(-12)" opacity="0.85">
    <circle r="34" fill="none" stroke="${color}" stroke-width="2.5" />
    <circle r="29" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="2 3" />
    <text y="-6" text-anchor="middle" class="stamp-text" fill="${color}">VERIFIED</text>
    <text y="8" text-anchor="middle" class="stamp-text" fill="${color}">CONTRIBUTOR</text>
    <path d="M-10 16l6 6 14-14" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  </g>`;
}

export function buildRepoPassportCard(
  data: RepoContributionsData,
  holderAvatar: string | null,
  holderLogin: string,
  theme: Theme
): string {
  const repoName = escapeXml(truncateText(data.fullName, 12, 200));
  const holder = escapeXml(truncateText(holderLogin, 13, 200));
  const rankLabel = data.rank ? `#${data.rank} / ${data.totalContributors}` : `${data.totalContributors} total`;

  const fields = [
    { label: "HOLDER", value: holder },
    { label: "REPOSITORY", value: repoName },
    { label: "COMMITS", value: String(data.contributions) },
    { label: "RANK", value: rankLabel },
  ];

  const fieldRows = fields
    .map((f, i) => {
      const y = PHOTO_Y + 8 + i * 26;
      return `<text x="${FIELD_X}" y="${y}" class="field-label">${f.label}</text>
  <text x="${FIELD_X + 92}" y="${y}" class="field-value">${escapeXml(truncateText(f.value, 12, WIDTH - FIELD_X - 92 - PADDING))}</text>`;
    })
    .join("\n  ");

  const barcodeY = HEIGHT - 58;

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Contributor passport for ${holder} — ${repoName}">
  <title>Contributor Passport — ${holder} — ${repoName}</title>
  <defs>
    <clipPath id="passportPhoto"><rect x="${PHOTO_X}" y="${PHOTO_Y}" width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" rx="4" /></clipPath>
    <linearGradient id="passportHolo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7dd3fc" /><stop offset="0.25" stop-color="#c4b5fd" />
      <stop offset="0.5" stop-color="#f9a8d4" /><stop offset="0.75" stop-color="#fde68a" />
      <stop offset="1" stop-color="#7dd3fc" />
    </linearGradient>
    ${thumbShadowFilter()}
    <style>
      .title { font: 700 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; letter-spacing: 2px; }
      .subtitle { font: 600 9px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.secondaryText}; letter-spacing: 1.5px; }
      .field-label { font: 700 9px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.secondaryText}; letter-spacing: 1px; }
      .field-value { font: 600 12px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.primaryText}; }
      .stamp-text { font: 700 6.5px 'Segoe UI', Helvetica, Arial, sans-serif; letter-spacing: 0.6px; }
      .brand { font: 600 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
    </style>
  </defs>

  <rect x="2" y="2" width="${WIDTH - 4}" height="${HEIGHT - 4}" rx="10" fill="${theme.background}" stroke="${theme.accent}" stroke-width="2.5" />
  <rect x="8" y="8" width="${WIDTH - 16}" height="${HEIGHT - 16}" rx="6" fill="none" stroke="${theme.border}" />
  <rect x="${WIDTH - 26}" y="8" width="10" height="${HEIGHT - 16}" fill="url(#passportHolo)" opacity="0.55" />

  <text x="${PADDING}" y="32" class="title">CONTRIBUTOR PASSPORT</text>
  <text x="${PADDING}" y="46" class="subtitle">ISSUED BY README CARDS · OPEN SOURCE REGISTRY</text>
  <line x1="${PADDING}" y1="54" x2="${WIDTH - PADDING}" y2="54" stroke="${theme.accent}" stroke-opacity="0.4" />

  <g filter="url(#thumbShadow)">
    ${holderAvatar
      ? `<image href="${holderAvatar}" x="${PHOTO_X}" y="${PHOTO_Y}" width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" clip-path="url(#passportPhoto)" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${PHOTO_X}" y="${PHOTO_Y}" width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" rx="4" fill="${theme.border}" />
      <g transform="translate(${PHOTO_X + PHOTO_SIZE / 2 - 6}, ${PHOTO_Y + PHOTO_SIZE / 2 - 7})">${appGlyph(theme.secondaryText)}</g>`}
  </g>
  <rect x="${PHOTO_X + 0.5}" y="${PHOTO_Y + 0.5}" width="${PHOTO_SIZE - 1}" height="${PHOTO_SIZE - 1}" rx="4" fill="none" stroke="${theme.accent}" stroke-opacity="0.5" />

  ${fieldRows}

  ${stamp(WIDTH - 90, HEIGHT - 90, theme.accent)}

  ${barcode(data.fullName + holderLogin, PADDING, barcodeY, WIDTH - PADDING * 2 - 140, 14, theme.secondaryText)}
  <g transform="translate(${PADDING}, ${barcodeY + 22})" opacity="0.85">
    ${appGlyph(theme.secondaryText)}
    <text x="18" y="11" class="brand">README CARDS</text>
  </g>
</svg>`;
}
