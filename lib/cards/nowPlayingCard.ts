import type { Track } from "../spotify";
import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";

const WIDTH = 480;
const HEIGHT = 140;
const ART_SIZE = 100;
const ART_X = 20;
const ART_Y = 20;
const CONTENT_X = 140;

export function buildNowPlayingCard(track: Track | null, albumArt: string | null, theme: Theme): string {
  if (!track) return buildEmptyCard(theme);

  const title = escapeXml(truncateText(track.title, 17, 290));
  const artist = escapeXml(truncateText(track.artist, 13, 280));
  const statusLabel = track.isPlaying ? "NOW PLAYING" : "LAST PLAYED";
  const pillWidth = Math.round(statusLabel.length * 7.4 + 34);
  const eqX = CONTENT_X + pillWidth + 12;

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} by ${artist} on Spotify">
  <title>${title} — ${artist}</title>
  <defs>
    <clipPath id="cardClip"><rect width="${WIDTH}" height="${HEIGHT}" rx="18" /></clipPath>
    <clipPath id="artClip"><rect x="${ART_X}" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" rx="16" /></clipPath>
    <filter id="bgBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="22" />
    </filter>
    <filter id="thumbShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.4" />
    </filter>
    <linearGradient id="overlay" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${theme.background}" stop-opacity="0.98" />
      <stop offset="0.5" stop-color="${theme.background}" stop-opacity="0.92" />
      <stop offset="1" stop-color="${theme.background}" stop-opacity="0.62" />
    </linearGradient>
    <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${theme.accent}" stop-opacity="0.55" />
      <stop offset="1" stop-color="${theme.accent}" stop-opacity="1" />
    </linearGradient>
    <style>
      .title { font: 700 17px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .artist { font: 400 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
      .bar { fill: url(#barGrad); }
    </style>
  </defs>

  <g clip-path="url(#cardClip)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${theme.background}" />
    ${albumArt ? `<image href="${albumArt}" x="-40" y="-40" width="${WIDTH + 80}" height="${HEIGHT + 80}" preserveAspectRatio="xMidYMid slice" filter="url(#bgBlur)" opacity="0.5" />` : ""}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#overlay)" />
  </g>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="18" fill="none" stroke="${theme.border}" />

  <g filter="url(#thumbShadow)">
    ${albumArt ? `<image href="${albumArt}" x="${ART_X}" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" clip-path="url(#artClip)" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${ART_X}" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" rx="16" fill="${theme.border}" />`}
  </g>
  <rect x="${ART_X + 0.5}" y="${ART_Y + 0.5}" width="${ART_SIZE - 1}" height="${ART_SIZE - 1}" rx="16" fill="none" stroke="${theme.accent}" stroke-opacity="0.35" />

  <g transform="translate(${CONTENT_X}, 18)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    ${statusDot(theme, track.isPlaying)}
    <text x="20" y="15" class="status">${statusLabel}</text>
  </g>
  ${track.isPlaying ? equalizer(eqX, 29) : ""}

  <text x="${CONTENT_X}" y="64" class="title">${title}</text>
  <text x="${CONTENT_X}" y="86" class="artist">${artist}</text>

  <line x1="${CONTENT_X}" y1="98" x2="${CONTENT_X + 280}" y2="98" stroke="${theme.border}" stroke-opacity="0.6" />

  <g transform="translate(${CONTENT_X}, 106)" opacity="0.85">
    ${spotifyGlyph(theme.accent, theme.background)}
    <text x="21" y="12" class="brand">SPOTIFY</text>
  </g>
</svg>`;
}

function statusDot(theme: Theme, isPlaying: boolean): string {
  if (!isPlaying) {
    return `<circle cx="10" cy="11" r="3" fill="${theme.secondaryText}" />`;
  }
  return `<circle cx="10" cy="11" r="3" fill="${theme.accent}">
    <animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" />
  </circle>`;
}

function equalizer(x: number, y: number): string {
  const heights = [7, 14, 9, 12];
  const bars = heights
    .map((peak, i) => {
      const delay = i * 0.12;
      const barX = x + i * 6;
      return `<rect class="bar" x="${barX}" y="${y}" width="3" height="4" rx="1.5">
        <animate attributeName="height" values="4;${peak};4" dur="0.9s" begin="${delay}s" repeatCount="indefinite" />
        <animate attributeName="y" values="${y + 6};${y + 6 - peak};${y + 6}" dur="0.9s" begin="${delay}s" repeatCount="indefinite" />
      </rect>`;
    })
    .join("");
  return `<g>${bars}</g>`;
}

function spotifyGlyph(accent: string, background: string): string {
  return `<circle cx="8" cy="8" r="8" fill="${accent}" />
  <path d="M4.2 6.6c2.4-.7 5.7-.55 7.9.7" stroke="${background}" stroke-width="1.1" stroke-linecap="round" fill="none" />
  <path d="M4.2 9c2.1-.55 4.9-.45 6.9.65" stroke="${background}" stroke-width="1.1" stroke-linecap="round" fill="none" />
  <path d="M4.5 11.3c1.7-.4 3.9-.3 5.5.6" stroke="${background}" stroke-width="1" stroke-linecap="round" fill="none" />`;
}

function buildEmptyCard(theme: Theme): string {
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No recent Spotify activity">
  <style>
    .msg { font: 500 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 5}" text-anchor="middle" class="msg">No recent Spotify activity</text>
</svg>`;
}
