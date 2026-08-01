import { escapeXml, truncateText } from "../text";
import { computeReportCardStats, honorsFor } from "./reportCardStats";
import type { GithubProfile, GithubRepo } from "../github";

const WIDTH = 420;
const HEIGHT = 300;
const PADDING = 26;

// Fixed "certificate" palette — a diploma should look the same regardless of the card's
// color theme, same rationale as the wanted poster's paper tone or the badge tiers.
const PAPER = "#f5efdc";
const GOLD = "#a9822f";
const INK = "#241f14";
const INK_SOFT = "#5c5340";

function flourish(x: number, y: number, rotate: number): string {
  return `<g transform="translate(${x}, ${y}) rotate(${rotate})">
    <path d="M0 -9 L3 0 L0 9 L-3 0 Z" fill="${GOLD}" opacity="0.6" />
  </g>`;
}

export function buildGithubDiplomaCard(profile: GithubProfile, repos: GithubRepo[]): string {
  const { gpa } = computeReportCardStats(profile, repos);
  const honors = honorsFor(gpa);
  const name = escapeXml(truncateText(profile.login, 24, WIDTH - PADDING * 2 - 20)).toUpperCase();

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Certificate of achievement for ${name} — ${honors}">
  <title>Certificate of Achievement — ${name} — ${honors}</title>
  <defs>
    <style>
      .header { font: 700 15px Georgia, 'Times New Roman', serif; fill: ${GOLD}; letter-spacing: 3px; }
      .script { font: italic 400 11px Georgia, 'Times New Roman', serif; fill: ${INK_SOFT}; }
      .name { font: 700 24px Georgia, 'Times New Roman', serif; fill: ${INK}; letter-spacing: 1px; }
      .honors { font: 700 15px Georgia, 'Times New Roman', serif; fill: ${GOLD}; letter-spacing: 1px; }
      .field { font: 400 italic 11px Georgia, 'Times New Roman', serif; fill: ${INK_SOFT}; }
      .gpa { font: 700 10px Georgia, 'Times New Roman', serif; fill: ${INK_SOFT}; letter-spacing: 1px; }
      .seal-text { font: 700 7px Georgia, 'Times New Roman', serif; fill: ${PAPER}; letter-spacing: 0.5px; }
      .signature { font: 700 9px Georgia, 'Times New Roman', serif; fill: ${INK_SOFT}; letter-spacing: 1px; }
    </style>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}" />
  <rect x="10" y="10" width="${WIDTH - 20}" height="${HEIGHT - 20}" fill="none" stroke="${GOLD}" stroke-width="3" />
  <rect x="16" y="16" width="${WIDTH - 32}" height="${HEIGHT - 32}" fill="none" stroke="${GOLD}" stroke-width="1" />

  ${flourish(30, 30, 45)}
  ${flourish(WIDTH - 30, 30, 45)}
  ${flourish(30, HEIGHT - 30, 45)}
  ${flourish(WIDTH - 30, HEIGHT - 30, 45)}

  <text x="${WIDTH / 2}" y="56" text-anchor="middle" class="header">CERTIFICATE OF ACHIEVEMENT</text>
  <text x="${WIDTH / 2}" y="82" text-anchor="middle" class="script">This certifies that</text>
  <text x="${WIDTH / 2}" y="114" text-anchor="middle" class="name">${name}</text>
  <text x="${WIDTH / 2}" y="138" text-anchor="middle" class="script">has been awarded, for distinguished open-source contributions, the honors of</text>
  <text x="${WIDTH / 2}" y="166" text-anchor="middle" class="honors">${escapeXml(honors).toUpperCase()}</text>
  <text x="${WIDTH / 2}" y="188" text-anchor="middle" class="field">in the discipline of Open Source Software Engineering</text>

  <line x1="${PADDING + 10}" y1="${HEIGHT - 56}" x2="150" y2="${HEIGHT - 56}" stroke="${INK_SOFT}" stroke-opacity="0.5" />
  <text x="${PADDING + 10}" y="${HEIGHT - 42}" class="signature">README CARDS REGISTRAR</text>
  <text x="${PADDING + 10}" y="${HEIGHT - 28}" class="gpa">GPA ${gpa.toFixed(2)}</text>

  <g transform="translate(${WIDTH - 60}, ${HEIGHT - 58}) rotate(-8)">
    <path d="M-14 8 L-8 34 L0 26 L8 34 L14 8 Z" fill="${GOLD}" opacity="0.85" />
    <circle r="18" fill="${GOLD}" />
    <circle r="18" fill="none" stroke="${INK}" stroke-opacity="0.2" stroke-width="1" />
    <text y="4" text-anchor="middle" class="seal-text">EST.</text>
  </g>
</svg>`;
}
