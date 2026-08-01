import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appGlyph, thumbShadowFilter } from "./shared";
import type { GithubProfile, GithubRepo } from "../github";

const WIDTH = 280;
const HEIGHT = 404;
const PADDING = 16;
const PHOTO_Y = 46;
const PHOTO_HEIGHT = 148;
const STAT_ROW_HEIGHT = 26;

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

const RARITY_COLOR: Record<Rarity, string> = {
  common: "#9ca3af",
  uncommon: "#4ade80",
  rare: "#38bdf8",
  epic: "#a855f7",
  legendary: "#f4c542",
};

function rarityFor(score: number): Rarity {
  if (score >= 80) return "legendary";
  if (score >= 60) return "epic";
  if (score >= 40) return "rare";
  if (score >= 20) return "uncommon";
  return "common";
}

interface Stat {
  label: string;
  raw: number;
  value: number; // 0-1, normalized
}

export function buildGithubTradingCard(profile: GithubProfile, repos: GithubRepo[], avatar: string | null, theme: Theme): string {
  const totalStars = repos.reduce((sum, r) => sum + (r.isFork ? 0 : r.stars), 0);
  const languageCount = new Set(repos.filter((r) => !r.isFork && r.language).map((r) => r.language)).size;
  const accountAgeYears = Math.max(0, (Date.now() - new Date(profile.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000));
  const topLanguage = repos.filter((r) => !r.isFork && r.language).sort((a, b) => b.stars - a.stars)[0]?.language ?? "CODE";

  const stats: Stat[] = [
    { label: "POWER", raw: totalStars, value: Math.min(totalStars / 500, 1) },
    { label: "INFLUENCE", raw: profile.followers, value: Math.min(profile.followers / 1000, 1) },
    { label: "VOLUME", raw: profile.publicRepos, value: Math.min(profile.publicRepos / 200, 1) },
    { label: "EXPERIENCE", raw: Math.round(accountAgeYears), value: Math.min(accountAgeYears / 10, 1) },
    { label: "VERSATILITY", raw: languageCount, value: Math.min(languageCount / 10, 1) },
  ];

  const overallScore = Math.round((stats.reduce((sum, s) => sum + s.value, 0) / stats.length) * 100);
  const rarity = rarityFor(overallScore);
  const rarityColor = RARITY_COLOR[rarity];

  const login = escapeXml(truncateText(profile.login, 15, 200));
  const className = escapeXml(truncateText(`${topLanguage} DEVELOPER`, 9, 190).toUpperCase());

  const statsY = PHOTO_Y + PHOTO_HEIGHT + 40;
  const statRows = stats
    .map((s, i) => {
      const y = statsY + i * STAT_ROW_HEIGHT;
      const barWidth = WIDTH - PADDING * 2 - 60;
      const fillWidth = Math.max(3, s.value * barWidth);
      return `<g transform="translate(0, ${y})">
    <text x="${PADDING}" y="10" class="stat-label">${s.label}</text>
    <rect x="${PADDING}" y="15" width="${barWidth}" height="5" rx="2.5" fill="${theme.border}" />
    <rect x="${PADDING}" y="15" width="${fillWidth}" height="5" rx="2.5" fill="${rarityColor}" />
    <text x="${WIDTH - PADDING}" y="10" text-anchor="end" class="stat-value">${s.raw}</text>
  </g>`;
    })
    .join("\n  ");

  const footerY = statsY + stats.length * STAT_ROW_HEIGHT + 8;

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${login} — ${rarity} developer card">
  <title>${login} — ${rarity.toUpperCase()} developer card</title>
  <defs>
    <clipPath id="tcPhoto"><rect x="${PADDING}" y="${PHOTO_Y}" width="${WIDTH - PADDING * 2}" height="${PHOTO_HEIGHT}" rx="10" /></clipPath>
    <linearGradient id="tcBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${rarityColor}" stop-opacity="0.22" />
      <stop offset="0.35" stop-color="${theme.background}" stop-opacity="1" />
    </linearGradient>
    ${thumbShadowFilter()}
    <style>
      .name { font: 700 16px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .rarity { font: 700 9px 'Segoe UI', Helvetica, Arial, sans-serif; letter-spacing: 1px; }
      .class-name { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${rarityColor}; letter-spacing: 1px; }
      .stat-label { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 0.6px; }
      .stat-value { font: 700 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .score { font: 700 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${rarityColor}; }
      .brand { font: 600 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
    </style>
  </defs>

  <rect x="2" y="2" width="${WIDTH - 4}" height="${HEIGHT - 4}" rx="20" fill="url(#tcBg)" stroke="${rarityColor}" stroke-width="3" />
  <rect x="7" y="7" width="${WIDTH - 14}" height="${HEIGHT - 14}" rx="15" fill="none" stroke="${rarityColor}" stroke-opacity="0.4" />

  <text x="${PADDING}" y="30" class="name">${login}</text>
  <g transform="translate(${WIDTH - PADDING - rarity.length * 6.6 - 20}, 18)">
    <rect width="${rarity.length * 6.6 + 20}" height="18" rx="9" fill="${rarityColor}" fill-opacity="0.2" />
    <text x="${(rarity.length * 6.6 + 20) / 2}" y="13" text-anchor="middle" class="rarity" fill="${rarityColor}">${rarity.toUpperCase()}</text>
  </g>

  <g filter="url(#thumbShadow)">
    ${avatar
      ? `<image href="${avatar}" x="${PADDING}" y="${PHOTO_Y}" width="${WIDTH - PADDING * 2}" height="${PHOTO_HEIGHT}" clip-path="url(#tcPhoto)" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${PADDING}" y="${PHOTO_Y}" width="${WIDTH - PADDING * 2}" height="${PHOTO_HEIGHT}" rx="10" fill="${theme.border}" />
      <g transform="translate(${WIDTH / 2 - 6}, ${PHOTO_Y + PHOTO_HEIGHT / 2 - 7})">${appGlyph(theme.secondaryText)}</g>`}
  </g>
  <rect x="${PADDING + 0.5}" y="${PHOTO_Y + 0.5}" width="${WIDTH - PADDING * 2 - 1}" height="${PHOTO_HEIGHT - 1}" rx="10" fill="none" stroke="${rarityColor}" stroke-opacity="0.6" stroke-width="2" />

  <text x="${WIDTH / 2}" y="${PHOTO_Y + PHOTO_HEIGHT + 22}" text-anchor="middle" class="class-name">${className}</text>

  <line x1="${PADDING}" y1="${statsY - 12}" x2="${WIDTH - PADDING}" y2="${statsY - 12}" stroke="${rarityColor}" stroke-opacity="0.3" />
  ${statRows}

  <line x1="${PADDING}" y1="${footerY}" x2="${WIDTH - PADDING}" y2="${footerY}" stroke="${theme.border}" stroke-opacity="0.6" />
  <g transform="translate(${PADDING}, ${footerY + 8})" opacity="0.85">
    ${appGlyph(theme.secondaryText)}
    <text x="18" y="12" class="brand">README CARDS</text>
  </g>
  <text x="${WIDTH - PADDING}" y="${footerY + 20}" text-anchor="end" class="score">SCORE ${overallScore}</text>
</svg>`;
}
