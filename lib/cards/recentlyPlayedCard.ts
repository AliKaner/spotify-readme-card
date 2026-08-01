import type { RecentTrack } from "../spotify";
import type { Theme } from "../themes";
import { escapeXml, truncateText, timeAgo } from "../text";
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

export interface RecentTrackWithArt {
  track: RecentTrack;
  art: string | null;
}

export function buildRecentlyPlayedCard(tracks: RecentTrackWithArt[], theme: Theme): string {
  if (tracks.length === 0) return buildEmptyCard(theme);

  const title = "Recently Played";
  const height = HEADER_HEIGHT + tracks.length * ROW_HEIGHT + FOOTER_HEIGHT;
  const heroArt = tracks[0]?.art ?? null;
  const pillLabel = title.toUpperCase();
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

  const rows = tracks
    .map(({ track, art }, i) => {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      const name = escapeXml(truncateText(track.title, 14, TEXT_MAX_WIDTH));
      const artist = escapeXml(truncateText(track.artist, 12, TEXT_MAX_WIDTH));
      const ago = track.playedAt ? escapeXml(timeAgo(track.playedAt)) : "";
      const isLast = i === tracks.length - 1;

      return `<g transform="translate(0, ${y})">
    <text x="27" y="32" text-anchor="middle" class="ago">${ago}</text>
    <g filter="url(#thumbShadow)">
      ${art ? `<clipPath id="recent-art${i}"><rect x="${ART_X}" y="8" width="${ART_SIZE}" height="${ART_SIZE}" rx="10" /></clipPath>
      <image href="${art}" x="${ART_X}" y="8" width="${ART_SIZE}" height="${ART_SIZE}" clip-path="url(#recent-art${i})" preserveAspectRatio="xMidYMid slice" />`
        : `<rect x="${ART_X}" y="8" width="${ART_SIZE}" height="${ART_SIZE}" rx="10" fill="${theme.border}" />`}
    </g>
    <rect x="${ART_X + 0.5}" y="8.5" width="${ART_SIZE - 1}" height="${ART_SIZE - 1}" rx="10" fill="none" stroke="${theme.accent}" stroke-opacity="0.3" />
    <text x="${CONTENT_X}" y="24" class="track-title">${name}</text>
    <text x="${CONTENT_X}" y="42" class="track-artist">${artist}</text>
    ${!isLast ? `<line x1="${PADDING}" y1="${ROW_HEIGHT}" x2="${RIGHT_EDGE}" y2="${ROW_HEIGHT}" stroke="${theme.border}" stroke-opacity="0.4" />` : ""}
  </g>`;
    })
    .join("\n  ");

  const footerY = HEADER_HEIGHT + tracks.length * ROW_HEIGHT;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
  <title>${title}</title>
  ${backdrop}
  <defs>
    ${thumbShadowFilter()}
    <style>
      .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
      .ago { font: 600 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .track-title { font: 600 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .track-artist { font: 400 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
    </style>
  </defs>

  <g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    ${clockIcon(theme.accent)}
    <text x="26" y="15" class="status">${pillLabel}</text>
  </g>

  ${rows}

  <line x1="${PADDING}" y1="${footerY + 8}" x2="${RIGHT_EDGE}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${brandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

function clockIcon(accent: string): string {
  return `<g transform="translate(11, 6)">
    <circle cx="5" cy="5" r="5" fill="none" stroke="${accent}" stroke-width="1.3" />
    <path d="M5 2.3V5l2 1.2" stroke="${accent}" stroke-width="1.3" stroke-linecap="round" fill="none" />
  </g>`;
}

function buildEmptyCard(theme: Theme): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No recent tracks available">
  <style>
    .msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="${RADIUS}" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No recent tracks available yet</text>
</svg>`;
}
