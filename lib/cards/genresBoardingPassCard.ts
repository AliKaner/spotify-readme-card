import type { Theme } from "../themes";
import type { GenreCount } from "../spotify";
import { escapeXml, truncateText } from "../text";
import { appGlyph, barcode } from "./shared";

const WIDTH = 480;
const HEIGHT = 170;
const STUB_WIDTH = 120;
const MAIN_WIDTH = WIDTH - STUB_WIDTH;
const PADDING = 20;

function airportCode(genre: string): string {
  const letters = genre.toUpperCase().replace(/[^A-Z]/g, "");
  return (letters + "XXX").slice(0, 3);
}

export function buildGenresBoardingPassCard(genres: GenreCount[], theme: Theme): string {
  if (genres.length === 0) return emptyCard(theme);

  const destination = genres[0].genre;
  const connecting = genres
    .slice(1, 4)
    .map((g) => g.genre)
    .join(", ");
  const code = airportCode(destination);
  const gate = `G${String(genres.length).padStart(2, "0")}`;
  const flightClass = genres.length >= 6 ? "ECLECTIC" : "FOCUSED";

  const destinationLabel = escapeXml(truncateText(destination, 24, MAIN_WIDTH - PADDING * 2).toUpperCase());
  const connectingLabel = connecting
    ? escapeXml(truncateText(connecting, 13, MAIN_WIDTH - PADDING * 2))
    : "NONSTOP";

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Boarding pass to ${escapeXml(destination)}">
  <title>Boarding Pass — ${escapeXml(destination)}</title>
  <defs>
    <style>
      .eyebrow { font: 700 8px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.background}; letter-spacing: 1.5px; }
      .field-label { font: 700 8px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.secondaryText}; letter-spacing: 1px; }
      .field-value { font: 700 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .dest { font: 700 24px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .code { font: 700 26px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.accent}; }
      .stub-label { font: 700 8px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; fill: ${theme.secondaryText}; letter-spacing: 1px; }
    </style>
  </defs>

  <rect x="0.5" y="0.5" width="${MAIN_WIDTH - 1}" height="${HEIGHT - 1}" rx="14" fill="${theme.background}" stroke="${theme.border}" />
  <rect x="0.5" y="0.5" width="${WIDTH - MAIN_WIDTH - 1}" height="${HEIGHT - 1}" rx="14" fill="${theme.background}" stroke="${theme.border}" transform="translate(${MAIN_WIDTH}, 0)" />

  <rect x="0" y="0" width="${MAIN_WIDTH}" height="22" rx="14" fill="${theme.accent}" />
  <rect x="0" y="10" width="${MAIN_WIDTH}" height="12" fill="${theme.accent}" />
  <text x="${PADDING}" y="15" class="eyebrow">SPOTIFY GENRE AIRLINES · BOARDING PASS</text>

  <text x="${PADDING}" y="48" class="field-label">DESTINATION</text>
  <text x="${PADDING}" y="72" class="dest">${destinationLabel}</text>

  <text x="${PADDING}" y="100" class="field-label">CONNECTING THROUGH</text>
  <text x="${PADDING}" y="116" class="field-value">${connectingLabel}</text>

  <text x="${PADDING}" y="146" class="field-label">GATE</text>
  <text x="${PADDING}" y="162" class="field-value">${gate}</text>
  <text x="${PADDING + 90}" y="146" class="field-label">CLASS</text>
  <text x="${PADDING + 90}" y="162" class="field-value">${flightClass}</text>

  <line x1="${MAIN_WIDTH}" y1="4" x2="${MAIN_WIDTH}" y2="${HEIGHT - 4}" stroke="${theme.border}" stroke-width="1.5" stroke-dasharray="4 4" />

  <g transform="translate(${MAIN_WIDTH}, 0)">
    <text x="${STUB_WIDTH / 2}" y="30" text-anchor="middle" class="code">${code}</text>
    <text x="${STUB_WIDTH / 2}" y="46" text-anchor="middle" class="stub-label">${destinationLabel.slice(0, 12)}</text>
    <text x="${STUB_WIDTH / 2}" y="70" text-anchor="middle" class="stub-label">${gate}</text>
    <g transform="translate(${STUB_WIDTH / 2 - 6}, 84)">${appGlyph(theme.secondaryText)}</g>
    ${barcode(destination + genres.length, 12, 116, STUB_WIDTH - 24, 34, theme.secondaryText)}
  </g>
</svg>`;
}

function emptyCard(theme: Theme): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No genre data available">
  <style>.msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No genre data available yet</text>
</svg>`;
}
