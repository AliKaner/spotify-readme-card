import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appGlyph, thumbShadowFilter } from "./shared";
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

interface Ability {
  id: string;
  raw: number;
  score: number; // 8-18, classic D&D range
}

function abilityScore(normalized: number): number {
  return Math.round(8 + Math.min(Math.max(normalized, 0), 1) * 10);
}

function modifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : String(mod);
}

export function buildGithubRpgSheetCard(profile: GithubProfile, repos: GithubRepo[], avatar: string | null, theme: Theme): string {
  const totalStars = repos.reduce((sum, r) => sum + (r.isFork ? 0 : r.stars), 0);
  const languageCount = new Set(repos.filter((r) => !r.isFork && r.language).map((r) => r.language)).size;
  const accountAgeYears = Math.max(0, (Date.now() - new Date(profile.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000));

  const abilities: Record<"STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA", Ability> = {
    STR: { id: "STR", raw: totalStars, score: abilityScore(totalStars / 500) },
    DEX: { id: "DEX", raw: languageCount, score: abilityScore(languageCount / 10) },
    CON: { id: "CON", raw: Math.round(accountAgeYears), score: abilityScore(accountAgeYears / 10) },
    INT: { id: "INT", raw: profile.publicRepos, score: abilityScore(profile.publicRepos / 200) },
    WIS: { id: "WIS", raw: profile.followers, score: abilityScore(profile.followers / 1000) },
    CHA: { id: "CHA", raw: profile.publicGists, score: abilityScore(profile.publicGists / 30) },
  };

  const CLASS_BY_ABILITY: Record<string, string> = {
    STR: "WARRIOR",
    DEX: "ROGUE",
    CON: "BARBARIAN",
    INT: "WIZARD",
    WIS: "CLERIC",
    CHA: "BARD",
  };
  const topAbility = Object.values(abilities).sort((a, b) => b.score - a.score)[0];
  const className = CLASS_BY_ABILITY[topAbility.id];

  const totalScore = Object.values(abilities).reduce((sum, a) => sum + a.score, 0);
  const level = Math.max(1, Math.min(20, Math.floor((totalScore - 48) / 6) + 1));
  const xpProgress = ((totalScore - 48) % 6) / 6;

  const name = escapeXml(truncateText(profile.login, 13, 170));

  const cells = Object.values(abilities)
    .map((a, i) => {
      const col = i % COLUMNS;
      const row = Math.floor(i / COLUMNS);
      const x = PADDING + col * ((WIDTH - PADDING * 2 - CELL_GAP * (COLUMNS - 1)) / COLUMNS + CELL_GAP);
      const y = STATS_Y_START + row * (CELL_HEIGHT + CELL_GAP);
      const cellWidth = (WIDTH - PADDING * 2 - CELL_GAP * (COLUMNS - 1)) / COLUMNS;
      return `<g transform="translate(${x}, ${y})">
    <rect width="${cellWidth}" height="${CELL_HEIGHT}" rx="10" fill="${theme.accent}" fill-opacity="0.1" stroke="${theme.accent}" stroke-opacity="0.35" />
    <text x="${cellWidth / 2}" y="20" text-anchor="middle" class="ability-id">${a.id}</text>
    <text x="${cellWidth / 2}" y="46" text-anchor="middle" class="ability-score">${a.score}</text>
    <text x="${cellWidth / 2}" y="63" text-anchor="middle" class="ability-mod">${modifier(a.score)}</text>
  </g>`;
    })
    .join("\n  ");

  const footerY = STATS_Y_START + ROWS * CELL_HEIGHT + (ROWS - 1) * CELL_GAP + 14;

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} — Level ${level} ${className}">
  <title>${name} — Level ${level} ${className}</title>
  <defs>
    <clipPath id="rpgPortrait"><rect x="${WIDTH - PADDING - PORTRAIT_SIZE}" y="14" width="${PORTRAIT_SIZE}" height="${PORTRAIT_SIZE}" rx="8" /></clipPath>
    ${thumbShadowFilter()}
    <style>
      .eyebrow { font: 700 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.6px; }
      .name { font: 700 18px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .class-level { font: 600 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 0.6px; }
      .xp-label { font: 700 8px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
      .ability-id { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
      .ability-score { font: 700 22px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .ability-mod { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; }
      .brand { font: 600 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
    </style>
  </defs>

  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="16" fill="${theme.background}" stroke="${theme.border}" />

  <text x="${PADDING}" y="26" class="eyebrow">CHARACTER SHEET</text>
  <text x="${PADDING}" y="48" class="name">${name}</text>
  <text x="${PADDING}" y="64" class="class-level">LEVEL ${level} ${className}</text>

  <text x="${PADDING}" y="82" class="xp-label">XP TO NEXT LEVEL</text>
  <rect x="${PADDING}" y="88" width="${WIDTH - PADDING * 2 - PORTRAIT_SIZE - 12}" height="6" rx="3" fill="${theme.border}" />
  <rect x="${PADDING}" y="88" width="${Math.max(4, xpProgress * (WIDTH - PADDING * 2 - PORTRAIT_SIZE - 12))}" height="6" rx="3" fill="${theme.accent}" />

  <g filter="url(#thumbShadow)">
    ${avatar
      ? `<image href="${avatar}" x="${WIDTH - PADDING - PORTRAIT_SIZE}" y="14" width="${PORTRAIT_SIZE}" height="${PORTRAIT_SIZE}" clip-path="url(#rpgPortrait)" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${WIDTH - PADDING - PORTRAIT_SIZE}" y="14" width="${PORTRAIT_SIZE}" height="${PORTRAIT_SIZE}" rx="8" fill="${theme.border}" />
      <g transform="translate(${WIDTH - PADDING - PORTRAIT_SIZE / 2 - 6}, ${14 + PORTRAIT_SIZE / 2 - 7})">${appGlyph(theme.secondaryText)}</g>`}
  </g>
  <rect x="${WIDTH - PADDING - PORTRAIT_SIZE + 0.5}" y="14.5" width="${PORTRAIT_SIZE - 1}" height="${PORTRAIT_SIZE - 1}" rx="8" fill="none" stroke="${theme.accent}" stroke-opacity="0.5" />

  <line x1="${PADDING}" y1="${STATS_Y_START - 14}" x2="${WIDTH - PADDING}" y2="${STATS_Y_START - 14}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${cells}

  <line x1="${PADDING}" y1="${footerY}" x2="${WIDTH - PADDING}" y2="${footerY}" stroke="${theme.border}" stroke-opacity="0.6" />
  <g transform="translate(${PADDING}, ${footerY + 10})" opacity="0.85">
    ${appGlyph(theme.secondaryText)}
    <text x="18" y="12" class="brand">README CARDS</text>
  </g>
</svg>`;
}
