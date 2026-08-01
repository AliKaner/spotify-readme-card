import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appBrandFooter } from "./shared";

export interface HobbyStatData {
  label: string;
  value: string;
  description?: string;
}

const WIDTH = 330;
const HEIGHT = 140;

export function buildHobbyStatCard(stat: HobbyStatData, theme: Theme): string {
  const value = escapeXml(truncateText(stat.value, 26, WIDTH - 32));
  const label = escapeXml(truncateText(stat.label, 14, WIDTH - 32));
  const description = stat.description ? escapeXml(truncateText(stat.description, 12, WIDTH - 32)) : "";

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <style>
    .value { font: 700 30px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; }
    .label { font: 600 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .desc { font: 400 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
    .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="16" y="56" class="value">${value}</text>
  <text x="16" y="78" class="label">${label}</text>
  ${description ? `<text x="16" y="96" class="desc">${description}</text>` : ""}
  ${appBrandFooter(theme, 16, HEIGHT - 28)}
</svg>`;
}
