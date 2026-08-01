import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appBrandFooter, appGlyph, thumbShadowFilter } from "./shared";

export interface HobbyStatData {
  label: string;
  value: string;
  description?: string;
}

const WIDTH = 480;
const HEIGHT = 140;
const ART_SIZE = 100;
const ART_X = 20;
const ART_Y = 20;
const CONTENT_X = 140;

export function buildHobbyStatCard(stat: HobbyStatData, art: string | null, theme: Theme): string {
  const value = escapeXml(truncateText(stat.value, 18, 280));
  const label = escapeXml(truncateText(stat.label, 22, 280));
  const description = stat.description ? escapeXml(truncateText(stat.description, 30, 280)) : "";
  const pillLabel = "HOBBY STAT";
  const pillWidth = Math.round(pillLabel.length * 6.6 + 24);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <defs>
    <clipPath id="hobbyArtClip"><rect x="${ART_X}" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" rx="16" /></clipPath>
    ${thumbShadowFilter()}
    <style>
      .value { font: 700 26px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; }
      .label { font: 600 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .desc { font: 400 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.2px; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
    </style>
  </defs>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <g filter="url(#thumbShadow)">
    ${art
      ? `<image href="${art}" x="${ART_X}" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" clip-path="url(#hobbyArtClip)" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${ART_X}" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" rx="16" fill="${theme.accent}" fill-opacity="0.12" />
      <g transform="translate(${ART_X + ART_SIZE / 2 - 6}, ${ART_Y + ART_SIZE / 2 - 7})">${appGlyph(theme.accent)}</g>`}
  </g>
  <rect x="${ART_X + 0.5}" y="${ART_Y + 0.5}" width="${ART_SIZE - 1}" height="${ART_SIZE - 1}" rx="16" fill="none" stroke="${theme.accent}" stroke-opacity="0.35" />
  <g transform="translate(${CONTENT_X}, 18)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    <text x="12" y="15" class="status">${pillLabel}</text>
  </g>
  <text x="${CONTENT_X}" y="66" class="value">${value}</text>
  <text x="${CONTENT_X}" y="86" class="label">${label}</text>
  ${description ? `<text x="${CONTENT_X}" y="102" class="desc">${description}</text>` : ""}
  <line x1="${CONTENT_X}" y1="112" x2="${CONTENT_X + 280}" y2="112" stroke="${theme.border}" stroke-opacity="0.6" />
  ${appBrandFooter(theme, CONTENT_X, 120)}
</svg>`;
}
