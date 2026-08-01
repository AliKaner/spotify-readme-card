import type { Theme } from "../../themes";
import { escapeXml, truncateText } from "../../text";
import { spotifyGlyph, thumbShadowFilter } from "../shared";

export type SingleItemGenericLayout = "compact" | "terminal" | "badge" | "portrait" | "split";

export interface SingleItemData {
  title: string;
  subtitle: string;
  art: string | null;
  statusLabel: string;
}

const WIDTH = 480;

export function renderSingleItemLayout(layout: SingleItemGenericLayout, data: SingleItemData, theme: Theme): string {
  switch (layout) {
    case "terminal":
      return terminal(data, theme);
    case "badge":
      return badge(data, theme);
    case "portrait":
      return portrait(data, theme);
    case "split":
      return split(data, theme);
    default:
      return compact(data, theme);
  }
}

export function emptySingleItemCard(theme: Theme, message: string, height = 140): string {
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(message)}">
  <style>.msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="16" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">${escapeXml(message)}</text>
</svg>`;
}

function compact(data: SingleItemData, theme: Theme): string {
  const HEIGHT = 64;
  const ART_SIZE = 44;
  const ART_X = 10;
  const CONTENT_X = 66;
  const artY = (HEIGHT - ART_SIZE) / 2;
  const title = escapeXml(truncateText(data.title, 26, 300));
  const subtitle = escapeXml(truncateText(data.subtitle, 22, 300));

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} — ${subtitle}">
  <title>${title} — ${subtitle}</title>
  <defs>
    <clipPath id="siCompactClip"><rect x="${ART_X}" y="${artY}" width="${ART_SIZE}" height="${ART_SIZE}" rx="10" /></clipPath>
    ${thumbShadowFilter()}
    <style>
      .title { font: 700 14px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .subtitle { font: 400 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
    </style>
  </defs>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="14" fill="${theme.background}" stroke="${theme.border}" />
  <g filter="url(#thumbShadow)">
    ${data.art ? `<image href="${data.art}" x="${ART_X}" y="${artY}" width="${ART_SIZE}" height="${ART_SIZE}" clip-path="url(#siCompactClip)" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${ART_X}" y="${artY}" width="${ART_SIZE}" height="${ART_SIZE}" rx="10" fill="${theme.border}" />`}
  </g>
  <rect x="${ART_X + 0.5}" y="${artY + 0.5}" width="${ART_SIZE - 1}" height="${ART_SIZE - 1}" rx="10" fill="none" stroke="${theme.accent}" stroke-opacity="0.35" />
  <circle cx="${CONTENT_X - 10}" cy="22" r="3" fill="${theme.accent}" />
  <text x="${CONTENT_X}" y="27" class="title">${title}</text>
  <text x="${CONTENT_X}" y="44" class="subtitle">${subtitle}</text>
  <g transform="translate(${WIDTH - 30}, ${HEIGHT / 2 - 8})" opacity="0.6">${spotifyGlyph(theme.accent, theme.background)}</g>
</svg>`;
}

function terminal(data: SingleItemData, theme: Theme): string {
  const HEIGHT = 120;
  const title = escapeXml(truncateText(data.title, 12, 340));
  const subtitle = escapeXml(truncateText(data.subtitle, 12, 340));
  const prompt = escapeXml(data.statusLabel.toLowerCase().replace(/\s+/g, "-"));

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} — ${subtitle}">
  <title>${title} — ${subtitle}</title>
  <style>
    .mono { font: 13px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }
    .prompt { fill: ${theme.accent}; }
    .key { fill: ${theme.secondaryText}; }
    .val { fill: ${theme.primaryText}; }
    .bar { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="12" fill="${theme.background}" stroke="${theme.border}" />
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="26" rx="12" fill="${theme.border}" fill-opacity="0.35" />
  <rect x="0.5" y="14" width="${WIDTH - 1}" height="13" fill="${theme.border}" fill-opacity="0.35" />
  <circle cx="18" cy="14" r="5" fill="#ff5f56" />
  <circle cx="34" cy="14" r="5" fill="#ffbd2e" />
  <circle cx="50" cy="14" r="5" fill="#27c93f" />
  <text x="${WIDTH / 2}" y="18" text-anchor="middle" class="bar">SPOTIFY.SH</text>
  <text x="18" y="52" class="mono prompt">$ <tspan class="key">${prompt}</tspan></text>
  <text x="18" y="76" class="mono"><tspan class="key">title</tspan><tspan class="val" dx="8">"${title}"</tspan></text>
  <text x="18" y="96" class="mono"><tspan class="key">by</tspan><tspan class="val" dx="20">${subtitle}</tspan></text>
  <rect x="18" y="103" width="8" height="13" fill="${theme.accent}">
    <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
  </rect>
</svg>`;
}

function badge(data: SingleItemData, theme: Theme): string {
  const HEIGHT = 40;
  const title = escapeXml(truncateText(`${data.title} — ${data.subtitle}`, 13, 380));

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
  <title>${title}</title>
  <style>.label { font: 600 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="${HEIGHT / 2}" fill="${theme.background}" stroke="${theme.border}" />
  <circle cx="20" cy="${HEIGHT / 2}" r="4" fill="${theme.accent}">
    <animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" />
  </circle>
  <text x="34" y="${HEIGHT / 2 + 4}" class="label">${title}</text>
  <g transform="translate(${WIDTH - 28}, ${HEIGHT / 2 - 8})" opacity="0.6">${spotifyGlyph(theme.accent, theme.background)}</g>
</svg>`;
}

function portrait(data: SingleItemData, theme: Theme): string {
  const WIDTH_P = 220;
  const HEIGHT = 280;
  const ART_HEIGHT = 170;
  const title = escapeXml(truncateText(data.title, 15, WIDTH_P - 32));
  const subtitle = escapeXml(truncateText(data.subtitle, 12, WIDTH_P - 32));
  const pillLabel = escapeXml(data.statusLabel.toUpperCase());
  const pillWidth = Math.min(Math.round(pillLabel.length * 6.6 + 24), WIDTH_P - 32);

  return `<svg width="${WIDTH_P}" height="${HEIGHT}" viewBox="0 0 ${WIDTH_P} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} — ${subtitle}">
  <title>${title} — ${subtitle}</title>
  <defs>
    <clipPath id="portraitClip"><rect width="${WIDTH_P}" height="${HEIGHT}" rx="18" /></clipPath>
    <clipPath id="portraitArtClip"><rect width="${WIDTH_P}" height="${ART_HEIGHT}" /></clipPath>
    <linearGradient id="portraitFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.5" stop-color="${theme.background}" stop-opacity="0" />
      <stop offset="1" stop-color="${theme.background}" stop-opacity="1" />
    </linearGradient>
    <style>
      .title { font: 700 15px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .subtitle { font: 400 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .status { font: 700 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.2px; }
    </style>
  </defs>
  <g clip-path="url(#portraitClip)">
    <rect width="${WIDTH_P}" height="${HEIGHT}" fill="${theme.background}" />
    <g clip-path="url(#portraitArtClip)">
      ${data.art ? `<image href="${data.art}" width="${WIDTH_P}" height="${ART_HEIGHT}" preserveAspectRatio="xMidYMid slice" />`
        : `<rect width="${WIDTH_P}" height="${ART_HEIGHT}" fill="${theme.border}" />`}
      <rect width="${WIDTH_P}" height="${ART_HEIGHT}" fill="url(#portraitFade)" />
    </g>
    <rect x="12" y="12" width="${pillWidth}" height="20" rx="10" fill="${theme.background}" fill-opacity="0.75" />
    <text x="${12 + pillWidth / 2}" y="26" text-anchor="middle" class="status">${pillLabel}</text>
    <text x="16" y="${ART_HEIGHT + 26}" class="title">${title}</text>
    <text x="16" y="${ART_HEIGHT + 46}" class="subtitle">${subtitle}</text>
  </g>
  <rect x="0.5" y="0.5" width="${WIDTH_P - 1}" height="${HEIGHT - 1}" rx="18" fill="none" stroke="${theme.border}" />
</svg>`;
}

function split(data: SingleItemData, theme: Theme): string {
  const HEIGHT = 140;
  const ART_WIDTH = 190;
  const CONTENT_X = ART_WIDTH + 28;
  const title = escapeXml(truncateText(data.title, 16, WIDTH - CONTENT_X - 16));
  const subtitle = escapeXml(truncateText(data.subtitle, 13, WIDTH - CONTENT_X - 16));
  const pillLabel = escapeXml(data.statusLabel.toUpperCase());
  const pillWidth = Math.round(pillLabel.length * 6.6 + 20);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} — ${subtitle}">
  <title>${title} — ${subtitle}</title>
  <defs>
    <clipPath id="splitCardClip"><rect width="${WIDTH}" height="${HEIGHT}" rx="18" /></clipPath>
    <clipPath id="splitArtClip"><rect width="${ART_WIDTH}" height="${HEIGHT}" /></clipPath>
    <style>
      .title { font: 700 16px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .subtitle { font: 400 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .status { font: 700 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.2px; }
    </style>
  </defs>
  <g clip-path="url(#splitCardClip)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${theme.background}" />
    <g clip-path="url(#splitArtClip)">
      ${data.art ? `<image href="${data.art}" width="${ART_WIDTH}" height="${HEIGHT}" preserveAspectRatio="xMidYMid slice" />`
        : `<rect width="${ART_WIDTH}" height="${HEIGHT}" fill="${theme.border}" />`}
    </g>
    <rect x="${ART_WIDTH}" width="2" height="${HEIGHT}" fill="${theme.accent}" fill-opacity="0.5" />
  </g>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="18" fill="none" stroke="${theme.border}" />
  <rect x="${CONTENT_X}" y="20" width="${pillWidth}" height="20" rx="10" fill="${theme.accent}" fill-opacity="0.16" />
  <text x="${CONTENT_X + pillWidth / 2}" y="34" text-anchor="middle" class="status">${pillLabel}</text>
  <text x="${CONTENT_X}" y="76" class="title">${title}</text>
  <text x="${CONTENT_X}" y="96" class="subtitle">${subtitle}</text>
</svg>`;
}
