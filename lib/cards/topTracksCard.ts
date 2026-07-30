import type { TopTrack } from "../spotify";
import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";

const WIDTH = 480;
const ROW_HEIGHT = 56;
const PADDING = 16;
const HEADER_HEIGHT = 44;

export interface TopTrackWithArt {
  track: TopTrack;
  art: string | null;
}

export function buildTopTracksCard(tracks: TopTrackWithArt[], theme: Theme, title = "Top Tracks"): string {
  if (tracks.length === 0) return buildEmptyCard(theme, title);

  const height = HEADER_HEIGHT + tracks.length * ROW_HEIGHT + PADDING;

  const rows = tracks
    .map(({ track, art }, i) => {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      const name = escapeXml(truncateText(track.title, 14, 280));
      const artist = escapeXml(truncateText(track.artist, 12, 280));

      return `<g transform="translate(${PADDING}, ${y})">
    <text x="0" y="30" class="rank">${i + 1}</text>
    ${art ? `
    <clipPath id="art${i}"><rect x="24" y="6" width="40" height="40" rx="6" /></clipPath>
    <image href="${art}" x="24" y="6" width="40" height="40" clip-path="url(#art${i})" preserveAspectRatio="xMidYMid slice" />
    ` : `<rect x="24" y="6" width="40" height="40" rx="6" fill="${theme.border}" />`}
    <text x="76" y="24" class="track-title">${name}</text>
    <text x="76" y="42" class="track-artist">${artist}</text>
  </g>`;
    })
    .join("\n  ");

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(title)}">
  <title>${escapeXml(title)}</title>
  <style>
    .header { font: 700 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.2px; }
    .rank { font: 700 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
    .track-title { font: 600 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .track-artist { font: 400 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="12" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${PADDING}" y="26" class="header">${escapeXml(title.toUpperCase())}</text>
  ${rows}
</svg>`;
}

function buildEmptyCard(theme: Theme, title: string): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No top tracks available">
  <style>
    .msg { font: 500 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="12" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No top tracks available yet</text>
</svg>`;
}
