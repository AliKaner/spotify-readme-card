import type { TopTrack } from "../spotify";
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

export interface TopTrackWithArt {
  track: TopTrack;
  art: string | null;
}

export function buildTopTracksCard(tracks: TopTrackWithArt[], theme: Theme, title = "Top Tracks"): string {
  if (tracks.length === 0) return buildEmptyCard(theme, title);

  const height = HEADER_HEIGHT + tracks.length * ROW_HEIGHT + FOOTER_HEIGHT;
  const heroArt = tracks[0]?.art ?? null;
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

  const rows = tracks
    .map(({ track, art }, i) => {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      const name = escapeXml(truncateText(track.title, 14, TEXT_MAX_WIDTH));
      const artist = escapeXml(truncateText(track.artist, 12, TEXT_MAX_WIDTH));
      const isLast = i === tracks.length - 1;

      return `<g transform="translate(0, ${y})">
    <circle cx="27" cy="28" r="13" fill="${theme.accent}" fill-opacity="0.16" />
    <text x="27" y="32" text-anchor="middle" class="rank">${i + 1}</text>
    <g filter="url(#thumbShadow)">
      ${art ? `<clipPath id="art${i}"><rect x="${ART_X}" y="8" width="${ART_SIZE}" height="${ART_SIZE}" rx="10" /></clipPath>
      <image href="${art}" x="${ART_X}" y="8" width="${ART_SIZE}" height="${ART_SIZE}" clip-path="url(#art${i})" preserveAspectRatio="xMidYMid slice" />`
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

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(title)}">
  <title>${escapeXml(title)}</title>
  ${backdrop}
  <defs>
    ${thumbShadowFilter()}
    <style>
      .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
      .rank { font: 700 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; }
      .track-title { font: 600 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .track-artist { font: 400 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
    </style>
  </defs>

  <g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    ${chartIcon(theme.accent)}
    <text x="26" y="15" class="status">${pillLabel}</text>
  </g>

  ${rows}

  <line x1="${PADDING}" y1="${footerY + 8}" x2="${RIGHT_EDGE}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${brandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

const GRID_COLUMNS = 3;
const GRID_GAP = 12;
const GRID_HEADER_HEIGHT = 46;
const GRID_FOOTER_HEIGHT = 38;
const GRID_LABEL_HEIGHT = 22;

export function buildTopTracksGridCard(tracks: TopTrackWithArt[], theme: Theme, title = "Top Tracks"): string {
  if (tracks.length === 0) return buildEmptyCard(theme, title);

  const columns = Math.min(GRID_COLUMNS, tracks.length);
  const rows = Math.ceil(tracks.length / columns);
  const cellSize = (WIDTH - PADDING * 2 - GRID_GAP * (columns - 1)) / columns;
  const cellHeight = cellSize + 6 + GRID_LABEL_HEIGHT;
  const gridHeight = rows * cellHeight + (rows - 1) * GRID_GAP;
  const height = GRID_HEADER_HEIGHT + gridHeight + GRID_FOOTER_HEIGHT;

  const heroArt = tracks[0]?.art ?? null;
  const pillLabel = escapeXml(title.toUpperCase());
  const pillWidth = Math.min(Math.round(pillLabel.length * 7.4 + 44), WIDTH - PADDING * 2);

  const backdrop = cardBackdrop({
    theme,
    width: WIDTH,
    height,
    radius: RADIUS,
    albumArt: heroArt,
    overlayStops: [
      { offset: 0, opacity: 0.85 },
      { offset: 1, opacity: 0.95 },
    ],
    gradientDirection: { x1: 0, y1: 0, x2: 0, y2: 1 },
  });

  const cells = tracks
    .map(({ track, art }, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = PADDING + col * (cellSize + GRID_GAP);
      const y = GRID_HEADER_HEIGHT + row * (cellHeight + GRID_GAP);
      const name = escapeXml(truncateText(track.title, 13, cellSize));

      return `<g transform="translate(${x}, ${y})">
    <g filter="url(#thumbShadow)">
      ${art ? `<clipPath id="grid-art${i}"><rect width="${cellSize}" height="${cellSize}" rx="10" /></clipPath>
      <image href="${art}" width="${cellSize}" height="${cellSize}" clip-path="url(#grid-art${i})" preserveAspectRatio="xMidYMid slice" />`
        : `<rect width="${cellSize}" height="${cellSize}" rx="10" fill="${theme.border}" />`}
    </g>
    <rect x="0.5" y="0.5" width="${cellSize - 1}" height="${cellSize - 1}" rx="10" fill="none" stroke="${theme.accent}" stroke-opacity="0.3" />
    <text x="${cellSize / 2}" y="${cellSize + 18}" text-anchor="middle" class="grid-title">${name}</text>
  </g>`;
    })
    .join("\n  ");

  const footerY = GRID_HEADER_HEIGHT + gridHeight;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(title)}">
  <title>${escapeXml(title)}</title>
  ${backdrop}
  <defs>
    ${thumbShadowFilter()}
    <style>
      .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
      .grid-title { font: 500 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
    </style>
  </defs>

  <g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    ${chartIcon(theme.accent)}
    <text x="26" y="15" class="status">${pillLabel}</text>
  </g>

  ${cells}

  <line x1="${PADDING}" y1="${footerY + 8}" x2="${RIGHT_EDGE}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${brandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

function chartIcon(accent: string): string {
  return `<g transform="translate(11, 6)">
    <rect x="0" y="6" width="3" height="4" rx="1" fill="${accent}" />
    <rect x="4.5" y="3" width="3" height="7" rx="1" fill="${accent}" />
    <rect x="9" y="0" width="3" height="10" rx="1" fill="${accent}" />
  </g>`;
}

function buildEmptyCard(theme: Theme, title: string): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No top tracks available">
  <style>
    .msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="${RADIUS}" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No top tracks available yet</text>
</svg>`;
}
