import type { TopArtist } from "../spotify";
import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { brandFooter, cardBackdrop, thumbShadowFilter } from "./shared";

const WIDTH = 330;
const PADDING = 16;
const ROW_HEIGHT = 56;
const HEADER_HEIGHT = 54;
const FOOTER_HEIGHT = 42;
const RADIUS = 18;
const ART_X = 48;
const ART_SIZE = 40;
const CONTENT_X = 96;
const RIGHT_EDGE = WIDTH - PADDING;
const TEXT_MAX_WIDTH = RIGHT_EDGE - CONTENT_X;

export interface TopArtistWithArt {
  artist: TopArtist;
  art: string | null;
}

export function buildTopArtistsCard(artists: TopArtistWithArt[], theme: Theme, title = "Top Artists"): string {
  if (artists.length === 0) return buildEmptyCard(theme, title);

  const height = HEADER_HEIGHT + artists.length * ROW_HEIGHT + FOOTER_HEIGHT;
  const heroArt = artists[0]?.art ?? null;
  const pillLabel = escapeXml(title.toUpperCase());
  const pillWidth = Math.min(Math.round(pillLabel.length * 7.4 + 44), WIDTH - PADDING * 2);

  const backdrop = cardBackdrop({
    theme,
    width: WIDTH,
    height,
    radius: RADIUS,
    albumArt: heroArt,
    overlayStops: [
      { offset: 0, opacity: 0.82 },
      { offset: 1, opacity: 0.95 },
    ],
    gradientDirection: { x1: 0, y1: 0, x2: 0, y2: 1 },
  });

  const rows = artists
    .map(({ artist, art }, i) => {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      const name = escapeXml(truncateText(artist.name, 14, TEXT_MAX_WIDTH));
      const genre = escapeXml(truncateText(artist.genre ?? "", 12, TEXT_MAX_WIDTH));
      const isLast = i === artists.length - 1;
      const cx = ART_X + ART_SIZE / 2;
      const cy = 8 + ART_SIZE / 2;

      return `<g transform="translate(0, ${y})">
    <circle cx="27" cy="28" r="13" fill="${theme.accent}" fill-opacity="0.16" />
    <text x="27" y="32" text-anchor="middle" class="rank">${i + 1}</text>
    <g filter="url(#thumbShadow)">
      ${art ? `<clipPath id="artist-art${i}"><circle cx="${cx}" cy="${cy}" r="${ART_SIZE / 2}" /></clipPath>
      <image href="${art}" x="${ART_X}" y="8" width="${ART_SIZE}" height="${ART_SIZE}" clip-path="url(#artist-art${i})" preserveAspectRatio="xMidYMid slice" />`
        : `<circle cx="${cx}" cy="${cy}" r="${ART_SIZE / 2}" fill="${theme.border}" />`}
    </g>
    <circle cx="${cx}" cy="${cy}" r="${ART_SIZE / 2 - 0.5}" fill="none" stroke="${theme.accent}" stroke-opacity="0.3" />
    <text x="${CONTENT_X}" y="24" class="track-title">${name}</text>
    ${genre ? `<text x="${CONTENT_X}" y="42" class="track-artist">${genre}</text>` : ""}
    ${!isLast ? `<line x1="${PADDING}" y1="${ROW_HEIGHT}" x2="${RIGHT_EDGE}" y2="${ROW_HEIGHT}" stroke="${theme.border}" stroke-opacity="0.4" />` : ""}
  </g>`;
    })
    .join("\n  ");

  const footerY = HEADER_HEIGHT + artists.length * ROW_HEIGHT;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(title)}">
  <title>${escapeXml(title)}</title>
  ${backdrop}
  <defs>
    ${thumbShadowFilter()}
    <style>
      .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
      .rank { font: 700 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; }
      .track-title { font: 600 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .track-artist { font: 400 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; text-transform: capitalize; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
    </style>
  </defs>

  <g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    ${micIcon(theme.accent)}
    <text x="26" y="15" class="status">${pillLabel}</text>
  </g>

  ${rows}

  <line x1="${PADDING}" y1="${footerY + 8}" x2="${RIGHT_EDGE}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${brandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

function micIcon(accent: string): string {
  return `<g transform="translate(11, 3)">
    <rect x="3" y="0" width="6" height="10" rx="3" fill="${accent}" />
    <path d="M0 6.5a6 6 0 0 0 12 0" stroke="${accent}" stroke-width="1.4" fill="none" stroke-linecap="round" />
    <line x1="6" y1="12.5" x2="6" y2="15" stroke="${accent}" stroke-width="1.4" stroke-linecap="round" />
  </g>`;
}

function buildEmptyCard(theme: Theme, title: string): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No top artists available">
  <style>
    .msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="${RADIUS}" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No top artists available yet</text>
</svg>`;
}
