import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appGlyph, thumbShadowFilter } from "./shared";
import { computeRpgStats, modifier } from "./rpgStats";
import type { GithubProfile, GithubRepo } from "../github";

const WIDTH = 300;
const PADDING = 16;
const PORTRAIT_SIZE = 84;
const STATS_Y_START = 152;
const CELL_GAP = 10;
const CELL_HEIGHT = 74;
const COLUMNS = 3;
const ROWS = 2;
const FOOTER_HEIGHT = 40;
const HEIGHT = STATS_Y_START + ROWS * CELL_HEIGHT + (ROWS - 1) * CELL_GAP + FOOTER_HEIGHT + PADDING;

export function buildGithubRpgSheetCard(profile: GithubProfile, repos: GithubRepo[], avatar: string | null, theme: Theme): string {
  const { abilities, className, classColor, level, xpProgress } = computeRpgStats(profile, repos);
  const name = escapeXml(truncateText(profile.login, 13, 170));

  const cellWidth = (WIDTH - PADDING * 2 - CELL_GAP * (COLUMNS - 1)) / COLUMNS;
  const cells = abilities
    .map((a, i) => {
      const col = i % COLUMNS;
      const row = Math.floor(i / COLUMNS);
      const x = PADDING + col * (cellWidth + CELL_GAP);
      const y = STATS_Y_START + row * (CELL_HEIGHT + CELL_GAP);
      return `<g transform="translate(${x}, ${y})">
    <rect width="${cellWidth}" height="${CELL_HEIGHT}" rx="10" fill="${classColor}" fill-opacity="0.12" stroke="${classColor}" stroke-opacity="0.4" />
    <text x="${cellWidth / 2}" y="20" text-anchor="middle" class="ability-id">${a.id}</text>
    <text x="${cellWidth / 2}" y="46" text-anchor="middle" class="ability-score">${a.score}</text>
    <text x="${cellWidth / 2}" y="63" text-anchor="middle" class="ability-mod" fill="${classColor}">${modifier(a.score)}</text>
  </g>`;
    })
    .join("\n  ");

  const footerY = STATS_Y_START + ROWS * CELL_HEIGHT + (ROWS - 1) * CELL_GAP + 14;
  const xpBarWidth = WIDTH - PADDING * 2 - PORTRAIT_SIZE - 12;

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} — Level ${level} ${className}">
  <title>${name} — Level ${level} ${className}</title>
  <defs>
    <clipPath id="rpgPortrait"><rect x="${WIDTH - PADDING - PORTRAIT_SIZE}" y="14" width="${PORTRAIT_SIZE}" height="${PORTRAIT_SIZE}" rx="8" /></clipPath>
    ${thumbShadowFilter()}
    <style>
      .eyebrow { font: 700 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${classColor}; letter-spacing: 1.6px; }
      .name { font: 700 18px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .class-level { font: 600 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 0.6px; }
      .xp-label { font: 700 8px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
      .ability-id { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
      .ability-score { font: 700 22px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .ability-mod { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; }
      .brand { font: 600 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
    </style>
  </defs>

  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="16" fill="${theme.background}" stroke="${classColor}" stroke-opacity="0.5" />

  <text x="${PADDING}" y="26" class="eyebrow">CHARACTER SHEET</text>
  <text x="${PADDING}" y="48" class="name">${name}</text>
  <text x="${PADDING}" y="64" class="class-level">LEVEL ${level} ${className}</text>

  <text x="${PADDING}" y="82" class="xp-label">XP TO NEXT LEVEL</text>
  <rect x="${PADDING}" y="88" width="${xpBarWidth}" height="6" rx="3" fill="${theme.border}" />
  <rect x="${PADDING}" y="88" width="${Math.max(4, xpProgress * xpBarWidth)}" height="6" rx="3" fill="${classColor}" />

  <g filter="url(#thumbShadow)">
    ${avatar
      ? `<image href="${avatar}" x="${WIDTH - PADDING - PORTRAIT_SIZE}" y="14" width="${PORTRAIT_SIZE}" height="${PORTRAIT_SIZE}" clip-path="url(#rpgPortrait)" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${WIDTH - PADDING - PORTRAIT_SIZE}" y="14" width="${PORTRAIT_SIZE}" height="${PORTRAIT_SIZE}" rx="8" fill="${theme.border}" />
      <g transform="translate(${WIDTH - PADDING - PORTRAIT_SIZE / 2 - 6}, ${14 + PORTRAIT_SIZE / 2 - 7})">${appGlyph(theme.secondaryText)}</g>`}
  </g>
  <rect x="${WIDTH - PADDING - PORTRAIT_SIZE + 0.5}" y="14.5" width="${PORTRAIT_SIZE - 1}" height="${PORTRAIT_SIZE - 1}" rx="8" fill="none" stroke="${classColor}" stroke-opacity="0.6" />

  <line x1="${PADDING}" y1="${STATS_Y_START - 14}" x2="${WIDTH - PADDING}" y2="${STATS_Y_START - 14}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${cells}

  <line x1="${PADDING}" y1="${footerY}" x2="${WIDTH - PADDING}" y2="${footerY}" stroke="${theme.border}" stroke-opacity="0.6" />
  <g transform="translate(${PADDING}, ${footerY + 10})" opacity="0.85">
    ${appGlyph(theme.secondaryText)}
    <text x="18" y="12" class="brand">README CARDS</text>
  </g>
</svg>`;
}
