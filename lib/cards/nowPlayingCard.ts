import type { Track } from "../spotify";
import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";

const WIDTH = 480;
const HEIGHT = 140;

export function buildNowPlayingCard(track: Track | null, albumArt: string | null, theme: Theme): string {
  if (!track) return buildEmptyCard(theme);

  const title = escapeXml(truncateText(track.title, 16, 280));
  const artist = escapeXml(truncateText(track.artist, 13, 280));
  const statusLabel = track.isPlaying ? "NOW PLAYING" : "LAST PLAYED";

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} by ${artist} on Spotify">
  <title>${title} — ${artist}</title>
  <style>
    .title { font: 600 16px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .artist { font: 400 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.5px; }
    .brand { font: 400 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
    .bar { fill: ${theme.accent}; }
  </style>

  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="12" fill="${theme.background}" stroke="${theme.border}" />

  ${albumArt ? `
  <clipPath id="albumClip">
    <rect x="20" y="20" width="100" height="100" rx="8" />
  </clipPath>
  <image href="${albumArt}" x="20" y="20" width="100" height="100" clip-path="url(#albumClip)" preserveAspectRatio="xMidYMid slice" />
  ` : `<rect x="20" y="20" width="100" height="100" rx="8" fill="${theme.border}" />`}

  <text x="140" y="38" class="status">${statusLabel}</text>
  ${track.isPlaying ? equalizer(theme, WIDTH - 56, 28) : ""}
  <text x="140" y="66" class="title">${title}</text>
  <text x="140" y="88" class="artist">${artist}</text>

  <g transform="translate(140, 106)">
    ${spotifyGlyph(theme.accent)}
    <text x="24" y="12" class="brand">Spotify</text>
  </g>
</svg>`;
}

function equalizer(theme: Theme, x: number, y: number): string {
  const bars = [0, 1, 2]
    .map((i) => {
      const delay = i * 0.15;
      const barX = x + i * 7;
      return `<rect class="bar" x="${barX}" y="${y}" width="3" height="4" rx="1.5">
        <animate attributeName="height" values="4;15;4" dur="0.9s" begin="${delay}s" repeatCount="indefinite" />
        <animate attributeName="y" values="${y + 6};${y - 3.5};${y + 6}" dur="0.9s" begin="${delay}s" repeatCount="indefinite" />
      </rect>`;
    })
    .join("");
  return `<g>${bars}</g>`;
}

function spotifyGlyph(color: string): string {
  return `<circle cx="7" cy="7" r="7" fill="${color}" opacity="0.15" />
  <path d="M3.6 6.1c1.9-.5 4.4-.4 6.1.6M3.9 8c1.6-.4 3.7-.3 5.1.5M4.2 9.8c1.3-.3 2.9-.2 4.1.4" stroke="${color}" stroke-width="0.95" stroke-linecap="round" fill="none" />`;
}

function buildEmptyCard(theme: Theme): string {
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No recent Spotify activity">
  <style>
    .msg { font: 500 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="12" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 5}" text-anchor="middle" class="msg">No recent Spotify activity</text>
</svg>`;
}
