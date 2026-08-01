import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appBrandFooter, thumbShadowFilter } from "./shared";

export interface GalleryImage {
  art: string | null;
  caption?: string;
}

const WIDTH = 330;
const HEIGHT = 200;

/** Bespoke default layout: a handful of overlapping, slightly rotated "polaroid" photos. */
export function buildGalleryStackCard(images: GalleryImage[], theme: Theme, title = "Gallery"): string {
  if (images.length === 0) return emptyCard(theme, title);

  const shown = images.slice(0, 4);
  const size = 110;
  const angles = [-8, 5, -3, 9];
  const baseX = WIDTH / 2 - size / 2;
  const baseY = 30;

  const photos = shown
    .map((img, i) => {
      const angle = angles[i % angles.length];
      const offsetX = (i - (shown.length - 1) / 2) * 26;
      const cx = baseX + size / 2 + offsetX;
      const cy = baseY + size / 2;
      return `<g transform="rotate(${angle} ${cx} ${cy})" filter="url(#thumbShadow)">
    <rect x="${baseX + offsetX - 6}" y="${baseY - 6}" width="${size + 12}" height="${size + 12}" rx="6" fill="#ffffff" />
    ${img.art
      ? `<clipPath id="gs${i}"><rect x="${baseX + offsetX}" y="${baseY}" width="${size}" height="${size}" rx="3" /></clipPath>
      <image href="${img.art}" x="${baseX + offsetX}" y="${baseY}" width="${size}" height="${size}" clip-path="url(#gs${i})" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${baseX + offsetX}" y="${baseY}" width="${size}" height="${size}" rx="3" fill="${theme.border}" />`}
  </g>`;
    })
    .join("\n  ");

  const label = escapeXml(truncateText(title, 10, WIDTH - 32));

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
  <title>${label}</title>
  <defs>
    ${thumbShadowFilter()}
    <style>
      .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
    </style>
  </defs>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="16" y="26" class="status">${label.toUpperCase()}</text>
  ${photos}
  ${appBrandFooter(theme, 16, HEIGHT - 28)}
</svg>`;
}

function emptyCard(theme: Theme, title: string): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No images in ${escapeXml(title)}">
  <style>.msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No images added yet</text>
</svg>`;
}
