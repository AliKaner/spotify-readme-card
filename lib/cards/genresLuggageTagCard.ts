import type { Theme } from "../themes";
import type { GenreCount } from "../spotify";
import { escapeXml, truncateText } from "../text";
import { appGlyph, barcode } from "./shared";

const WIDTH = 220;
const PADDING = 18;
const HOLE_Y = 26;
const HOLE_R = 7;
const HEADER_Y = 56;

function airportCode(genre: string): string {
  const letters = genre.toUpperCase().replace(/[^A-Z]/g, "");
  return (letters + "XXX").slice(0, 3);
}

export function buildGenresLuggageTagCard(genres: GenreCount[], theme: Theme): string {
  if (genres.length === 0) return emptyCard(theme);

  const destination = genres[0].genre;
  const via = genres
    .slice(1, 3)
    .map((g) => g.genre)
    .join(" · ");
  const code = airportCode(destination);
  const destinationLabel = escapeXml(truncateText(destination, 15, WIDTH - PADDING * 2).toUpperCase());
  const viaLabel = via ? escapeXml(truncateText(via, 10, WIDTH - PADDING * 2)) : "DIRECT";

  const codeY = HEADER_Y + 30;
  const destY = codeY + 34;
  const viaLabelY = destY + 24;
  const viaValueY = viaLabelY + 18;
  const dividerY = viaValueY + 16;
  const barcodeY = dividerY + 16;
  const brandY = barcodeY + 30;
  const height = brandY + 16;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Luggage tag to ${escapeXml(destination)}">
  <title>Luggage Tag — ${escapeXml(destination)}</title>
  <defs>
    <style>
      .code { font: 700 30px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.accent}; }
      .dest { font: 700 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .via-label { font: 700 8px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
      .via-value { font: 600 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .brand { font: 600 8px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
    </style>
  </defs>

  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="16" fill="${theme.background}" stroke="${theme.border}" />
  <path d="M${WIDTH / 2 - 14} 14 a14 10 0 0 1 28 0" fill="none" stroke="${theme.border}" stroke-width="2.5" />
  <circle cx="${WIDTH / 2}" cy="${HOLE_Y}" r="${HOLE_R}" fill="${theme.background}" stroke="${theme.border}" stroke-width="2.5" />

  <line x1="${PADDING}" y1="${HEADER_Y}" x2="${WIDTH - PADDING}" y2="${HEADER_Y}" stroke="${theme.accent}" stroke-opacity="0.4" />
  <text x="${WIDTH / 2}" y="${codeY}" text-anchor="middle" class="code">${code}</text>
  <text x="${WIDTH / 2}" y="${destY}" text-anchor="middle" class="dest">${destinationLabel}</text>

  <text x="${WIDTH / 2}" y="${viaLabelY}" text-anchor="middle" class="via-label">VIA</text>
  <text x="${WIDTH / 2}" y="${viaValueY}" text-anchor="middle" class="via-value">${viaLabel}</text>

  <line x1="${PADDING}" y1="${dividerY}" x2="${WIDTH - PADDING}" y2="${dividerY}" stroke="${theme.border}" stroke-dasharray="3 3" />
  ${barcode(destination, PADDING, barcodeY, WIDTH - PADDING * 2, 20, theme.secondaryText)}

  <g transform="translate(${WIDTH / 2 - 30}, ${brandY - 8})" opacity="0.85">
    ${appGlyph(theme.secondaryText)}
    <text x="18" y="10" class="brand">README CARDS</text>
  </g>
</svg>`;
}

function emptyCard(theme: Theme): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No genre data available">
  <style>.msg { font: 500 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="16" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No genre data yet</text>
</svg>`;
}
