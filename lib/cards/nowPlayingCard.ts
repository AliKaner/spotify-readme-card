import type { Track } from "../spotify";
import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { brandFooter, cardBackdrop, spotifyGlyph, thumbShadowFilter } from "./shared";

const WIDTH = 480;
const HEIGHT = 140;
const ART_SIZE = 100;
const ART_X = 20;
const ART_Y = 20;
const CONTENT_X = 140;

const COMPACT_HEIGHT = 64;
const COMPACT_ART_SIZE = 44;
const COMPACT_ART_X = 10;
const COMPACT_CONTENT_X = 66;

export function buildNowPlayingCard(track: Track | null, albumArt: string | null, theme: Theme): string {
  if (!track) return buildEmptyCard(theme);

  const title = escapeXml(truncateText(track.title, 17, 290));
  const artist = escapeXml(truncateText(track.artist, 13, 280));
  const statusLabel = track.isPlaying ? "NOW PLAYING" : "LAST PLAYED";
  const pillWidth = Math.round(statusLabel.length * 7.4 + 34);
  const eqX = CONTENT_X + pillWidth + 12;

  const backdrop = cardBackdrop({
    theme,
    width: WIDTH,
    height: HEIGHT,
    radius: 18,
    albumArt,
    overlayStops: [
      { offset: 0, opacity: 0.88 },
      { offset: 0.5, opacity: 0.72 },
      { offset: 1, opacity: 0.32 },
    ],
  });

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} by ${artist} on Spotify">
  <title>${title} — ${artist}</title>
  ${backdrop}
  <defs>
    <clipPath id="artClip"><rect x="${ART_X}" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" rx="16" /></clipPath>
    ${thumbShadowFilter()}
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

  ${brandFooter(theme, CONTENT_X, 106)}
</svg>`;
}

export function buildNowPlayingCompactCard(track: Track | null, albumArt: string | null, theme: Theme): string {
  if (!track) return buildEmptyCard(theme, COMPACT_HEIGHT);

  const title = escapeXml(truncateText(track.title, 14, 300));
  const artist = escapeXml(truncateText(track.artist, 12, 300));
  const artY = (COMPACT_HEIGHT - COMPACT_ART_SIZE) / 2;

  return `<svg width="${WIDTH}" height="${COMPACT_HEIGHT}" viewBox="0 0 ${WIDTH} ${COMPACT_HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} by ${artist} on Spotify">
  <title>${title} — ${artist}</title>
  <defs>
    <clipPath id="compactArtClip"><rect x="${COMPACT_ART_X}" y="${artY}" width="${COMPACT_ART_SIZE}" height="${COMPACT_ART_SIZE}" rx="10" /></clipPath>
    ${thumbShadowFilter()}
    <style>
      .ctitle { font: 700 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .cartist { font: 400 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
    </style>
  </defs>

  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${COMPACT_HEIGHT - 1}" rx="14" fill="${theme.background}" stroke="${theme.border}" />

  <g filter="url(#thumbShadow)">
    ${albumArt ? `<image href="${albumArt}" x="${COMPACT_ART_X}" y="${artY}" width="${COMPACT_ART_SIZE}" height="${COMPACT_ART_SIZE}" clip-path="url(#compactArtClip)" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${COMPACT_ART_X}" y="${artY}" width="${COMPACT_ART_SIZE}" height="${COMPACT_ART_SIZE}" rx="10" fill="${theme.border}" />`}
  </g>
  <rect x="${COMPACT_ART_X + 0.5}" y="${artY + 0.5}" width="${COMPACT_ART_SIZE - 1}" height="${COMPACT_ART_SIZE - 1}" rx="10" fill="none" stroke="${theme.accent}" stroke-opacity="0.35" />

  ${statusDot(theme, track.isPlaying, COMPACT_CONTENT_X - 10, 22)}
  <text x="${COMPACT_CONTENT_X}" y="27" class="ctitle">${title}</text>
  <text x="${COMPACT_CONTENT_X}" y="44" class="cartist">${artist}</text>

  <g transform="translate(${WIDTH - 30}, ${COMPACT_HEIGHT / 2 - 8})" opacity="0.6">
    ${spotifyGlyph(theme.accent, theme.background)}
  </g>
</svg>`;
}

function statusDot(theme: Theme, isPlaying: boolean, x = 10, y = 11): string {
  if (!isPlaying) {
    return `<circle cx="${x}" cy="${y}" r="3" fill="${theme.secondaryText}" />`;
  }
  return `<circle cx="${x}" cy="${y}" r="3" fill="${theme.accent}">
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

function buildEmptyCard(theme: Theme, height: number = HEIGHT): string {
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No recent Spotify activity">
  <style>
    .msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="14" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No recent Spotify activity</text>
</svg>`;
}
