import { escapeXml, truncateText } from "../text";
import { computeRpgStats } from "./rpgStats";
import type { GithubProfile, GithubRepo } from "../github";

const WIDTH = 280;
const ROD_HEIGHT = 16;
const PADDING = 22;
const HEADER_HEIGHT = 76;
const ROW_HEIGHT = 27;
const SEAL_HEIGHT = 108;

const PAPER = "#ecdfc0";
const PAPER_SHADE = "#ddc99a";
const INK = "#3d2817";
const INK_SOFT = "#6b5133";
const ROD_COLOR = "#8b6b3d";

export function buildGithubRpgScrollCard(profile: GithubProfile, repos: GithubRepo[]): string {
  const { abilities, className, classColor, level } = computeRpgStats(profile, repos);
  const name = escapeXml(truncateText(profile.login, 18, WIDTH - PADDING * 2)).toUpperCase();

  const bodyHeight = HEADER_HEIGHT + abilities.length * ROW_HEIGHT + SEAL_HEIGHT;
  const height = ROD_HEIGHT * 2 + bodyHeight;

  const rows = abilities
    .map((a, i) => {
      const y = ROD_HEIGHT + HEADER_HEIGHT + i * ROW_HEIGHT;
      const r = 9;
      const circumference = 2 * Math.PI * r;
      const dash = Math.max(1, a.value * circumference);
      const cx = PADDING + r;
      const cy = y + 10;
      return `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-opacity="0.2" stroke-width="3" />
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${classColor}" stroke-width="3" stroke-linecap="round"
      stroke-dasharray="${dash} ${circumference}" transform="rotate(-90 ${cx} ${cy})" />
    <text x="${PADDING + 26}" y="${y + 14}" class="ability">${a.id}</text>
    <text x="${WIDTH - PADDING}" y="${y + 14}" text-anchor="end" class="score">${a.score}</text>
  </g>`;
    })
    .join("\n  ");

  const sealY = ROD_HEIGHT + HEADER_HEIGHT + abilities.length * ROW_HEIGHT + 20;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} — Level ${level} ${className} scroll">
  <title>${name} — Level ${level} ${className}</title>
  <defs>
    <style>
      .title { font: italic 700 13px Georgia, 'Times New Roman', serif; fill: ${INK}; letter-spacing: 1px; }
      .name { font: 700 17px Georgia, 'Times New Roman', serif; fill: ${INK}; }
      .class-level { font: 700 10px Georgia, 'Times New Roman', serif; fill: ${INK_SOFT}; letter-spacing: 1.5px; }
      .ability { font: 700 12px Georgia, 'Times New Roman', serif; fill: ${INK}; }
      .score { font: 700 14px Georgia, 'Times New Roman', serif; fill: ${INK}; }
      .seal-text { font: 700 8px Georgia, 'Times New Roman', serif; fill: ${PAPER}; letter-spacing: 1px; }
      .brand { font: 600 8px Georgia, 'Times New Roman', serif; fill: ${INK_SOFT}; letter-spacing: 0.6px; }
    </style>
  </defs>

  <rect x="0" y="0" width="${WIDTH}" height="${ROD_HEIGHT}" rx="8" fill="${ROD_COLOR}" />
  <rect x="0" y="${height - ROD_HEIGHT}" width="${WIDTH}" height="${ROD_HEIGHT}" rx="8" fill="${ROD_COLOR}" />
  <circle cx="6" cy="${ROD_HEIGHT / 2}" r="7" fill="${ROD_COLOR}" />
  <circle cx="${WIDTH - 6}" cy="${ROD_HEIGHT / 2}" r="7" fill="${ROD_COLOR}" />
  <circle cx="6" cy="${height - ROD_HEIGHT / 2}" r="7" fill="${ROD_COLOR}" />
  <circle cx="${WIDTH - 6}" cy="${height - ROD_HEIGHT / 2}" r="7" fill="${ROD_COLOR}" />

  <rect x="0" y="${ROD_HEIGHT}" width="${WIDTH}" height="${bodyHeight}" fill="${PAPER}" />
  <rect x="4" y="${ROD_HEIGHT + 4}" width="${WIDTH - 8}" height="${bodyHeight - 8}" fill="none" stroke="${PAPER_SHADE}" stroke-width="2" />

  <text x="${WIDTH / 2}" y="${ROD_HEIGHT + 30}" text-anchor="middle" class="title">CHARACTER SCROLL</text>
  <text x="${WIDTH / 2}" y="${ROD_HEIGHT + 50}" text-anchor="middle" class="name">${name}</text>
  <text x="${WIDTH / 2}" y="${ROD_HEIGHT + 66}" text-anchor="middle" class="class-level">LEVEL ${level} · ${className}</text>

  <line x1="${PADDING}" y1="${ROD_HEIGHT + HEADER_HEIGHT - 10}" x2="${WIDTH - PADDING}" y2="${ROD_HEIGHT + HEADER_HEIGHT - 10}" stroke="${INK_SOFT}" stroke-opacity="0.4" />
  ${rows}

  <g transform="translate(${WIDTH / 2}, ${sealY + 40}) rotate(-8)">
    <circle r="32" fill="${classColor}" />
    <circle r="32" fill="none" stroke="${INK}" stroke-opacity="0.25" stroke-width="1.5" />
    <path d="M-10 6 L0 -12 L10 6 L0 1 Z" fill="${PAPER}" opacity="0.9" />
    <text y="20" text-anchor="middle" class="seal-text">SEALED</text>
  </g>
  <text x="${WIDTH / 2}" y="${height - ROD_HEIGHT - 12}" text-anchor="middle" class="brand">README CARDS · CHARACTER REGISTRY</text>
</svg>`;
}
