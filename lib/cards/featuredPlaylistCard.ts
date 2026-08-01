import type { FeaturedPlaylist } from "../spotify";
import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { brandFooter, cardBackdrop, thumbShadowFilter } from "./shared";

const WIDTH = 480;
const HEIGHT = 140;
const ART_SIZE = 100;
const ART_X = 20;
const ART_Y = 20;
const CONTENT_X = 140;

export function buildFeaturedPlaylistCard(playlist: FeaturedPlaylist | null, art: string | null, theme: Theme): string {
  if (!playlist) return buildEmptyCard(theme);

  const name = escapeXml(truncateText(playlist.name, 17, 290));
  const meta = escapeXml(truncateText(`${playlist.trackCount} tracks · by ${playlist.owner}`, 13, 280));
  const pillLabel = "FEATURED PLAYLIST";
  const pillWidth = Math.round(pillLabel.length * 7.4 + 34);

  const backdrop = cardBackdrop({
    theme,
    width: WIDTH,
    height: HEIGHT,
    radius: 18,
    albumArt: art,
    overlayStops: [
      { offset: 0, opacity: 0.88 },
      { offset: 0.5, opacity: 0.72 },
      { offset: 1, opacity: 0.32 },
    ],
  });

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} playlist on Spotify">
  <title>${name}</title>
  ${backdrop}
  <defs>
    <clipPath id="featPlaylistClip"><rect x="${ART_X}" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" rx="12" /></clipPath>
    ${thumbShadowFilter()}
    <style>
      .title { font: 700 17px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .artist { font: 400 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
    </style>
  </defs>

  <g filter="url(#thumbShadow)">
    ${art ? `<image href="${art}" x="${ART_X}" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" clip-path="url(#featPlaylistClip)" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${ART_X}" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" rx="12" fill="${theme.border}" />`}
  </g>
  <rect x="${ART_X + 0.5}" y="${ART_Y + 0.5}" width="${ART_SIZE - 1}" height="${ART_SIZE - 1}" rx="12" fill="none" stroke="${theme.accent}" stroke-opacity="0.35" />

  <g transform="translate(${CONTENT_X}, 18)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    <circle cx="10" cy="11" r="3" fill="${theme.accent}" />
    <text x="20" y="15" class="status">${pillLabel}</text>
  </g>

  <text x="${CONTENT_X}" y="64" class="title">${name}</text>
  <text x="${CONTENT_X}" y="86" class="artist">${meta}</text>

  <line x1="${CONTENT_X}" y1="98" x2="${CONTENT_X + 280}" y2="98" stroke="${theme.border}" stroke-opacity="0.6" />

  ${brandFooter(theme, CONTENT_X, 106)}
</svg>`;
}

function buildEmptyCard(theme: Theme): string {
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No featured playlist">
  <style>
    .msg { font: 500 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 5}" text-anchor="middle" class="msg">Playlist not found</text>
</svg>`;
}
