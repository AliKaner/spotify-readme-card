import type { Theme } from "../../themes";
import { escapeXml, truncateText } from "../../text";
import { brandFooter, thumbShadowFilter } from "../shared";

export type RankedListGenericLayout = "grid" | "avatars" | "terminal" | "bars" | "compact";

export interface RankedItem {
  title: string;
  subtitle?: string;
  art: string | null;
}

const WIDTH = 330;
const PADDING = 16;
const RIGHT_EDGE = WIDTH - PADDING;

export function renderRankedListLayout(
  layout: RankedListGenericLayout,
  items: RankedItem[],
  theme: Theme,
  headerLabel: string
): string {
  if (items.length === 0) return emptyCard(theme, headerLabel);

  switch (layout) {
    case "grid":
      return grid(items, theme, headerLabel);
    case "avatars":
      return avatars(items, theme, headerLabel);
    case "terminal":
      return terminal(items, theme, headerLabel);
    case "bars":
      return bars(items, theme, headerLabel);
    default:
      return compact(items, theme, headerLabel);
  }
}

function emptyCard(theme: Theme, headerLabel: string): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No ${escapeXml(headerLabel)} available">
  <style>.msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No ${escapeXml(headerLabel)} available yet</text>
</svg>`;
}

function header(label: string, theme: Theme, icon: string): string {
  const pillLabel = escapeXml(label.toUpperCase());
  const pillWidth = Math.min(Math.round(pillLabel.length * 7.4 + 44), WIDTH - PADDING * 2);
  return `<g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    ${icon}
    <text x="26" y="15" class="status">${pillLabel}</text>
  </g>`;
}

function grid(items: RankedItem[], theme: Theme, headerLabel: string): string {
  const columns = Math.min(3, items.length);
  const rows = Math.ceil(items.length / columns);
  const gap = 12;
  const headerH = 46;
  const labelH = 20;
  const cellSize = (WIDTH - PADDING * 2 - gap * (columns - 1)) / columns;
  const cellHeight = cellSize + 6 + labelH;
  const gridHeight = rows * cellHeight + (rows - 1) * gap;
  const footerH = 38;
  const height = headerH + gridHeight + footerH;

  const cells = items
    .map((item, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = PADDING + col * (cellSize + gap);
      const y = headerH + row * (cellHeight + gap);
      const name = escapeXml(truncateText(item.title, 11, cellSize));
      return `<g transform="translate(${x}, ${y})">
    <g filter="url(#thumbShadow)">
      ${item.art ? `<clipPath id="gr${i}"><rect width="${cellSize}" height="${cellSize}" rx="10" /></clipPath>
      <image href="${item.art}" width="${cellSize}" height="${cellSize}" clip-path="url(#gr${i})" preserveAspectRatio="xMidYMid slice" />`
        : `<rect width="${cellSize}" height="${cellSize}" rx="10" fill="${theme.border}" />`}
    </g>
    <rect x="0.5" y="0.5" width="${cellSize - 1}" height="${cellSize - 1}" rx="10" fill="none" stroke="${theme.accent}" stroke-opacity="0.3" />
    <text x="${cellSize / 2}" y="${cellSize + 18}" text-anchor="middle" class="grid-title">${name}</text>
  </g>`;
    })
    .join("\n  ");

  const footerY = headerH + gridHeight;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(headerLabel)}">
  <title>${escapeXml(headerLabel)}</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <defs>
    ${thumbShadowFilter()}
    <style>
      .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
      .grid-title { font: 500 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
    </style>
  </defs>
  ${header(headerLabel, theme, chartIcon(theme.accent))}
  ${cells}
  <line x1="${PADDING}" y1="${footerY + 8}" x2="${RIGHT_EDGE}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${brandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

function avatars(items: RankedItem[], theme: Theme, headerLabel: string): string {
  const HEIGHT = 128;
  const size = 56;
  const gap = 14;
  const totalWidth = items.length * size + (items.length - 1) * gap;
  const startX = Math.max(PADDING, (WIDTH - totalWidth) / 2);

  const circles = items
    .map((item, i) => {
      const cx = startX + i * (size + gap) + size / 2;
      const cy = 62;
      const name = escapeXml(truncateText(item.title, 10, size + gap));
      return `<g>
    <g filter="url(#thumbShadow)">
      ${item.art ? `<clipPath id="av${i}"><circle cx="${cx}" cy="${cy}" r="${size / 2}" /></clipPath>
      <image href="${item.art}" x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}" clip-path="url(#av${i})" preserveAspectRatio="xMidYMid slice" />`
        : `<circle cx="${cx}" cy="${cy}" r="${size / 2}" fill="${theme.border}" />`}
    </g>
    <circle cx="${cx}" cy="${cy}" r="${size / 2 - 0.5}" fill="none" stroke="${theme.accent}" stroke-opacity="0.35" />
    <text x="${cx}" y="${cy + size / 2 + 16}" text-anchor="middle" class="avatar-name">${name}</text>
  </g>`;
    })
    .join("\n  ");

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(headerLabel)}">
  <title>${escapeXml(headerLabel)}</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <defs>
    ${thumbShadowFilter()}
    <style>
      .avatar-name { font: 500 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
    </style>
  </defs>
  ${circles}
</svg>`;
}

function terminal(items: RankedItem[], theme: Theme, headerLabel: string): string {
  const lineH = 20;
  const startY = 52;
  const HEIGHT = startY + items.length * lineH + 16;
  const prompt = escapeXml(headerLabel.toLowerCase().replace(/\s+/g, "-"));

  const lines = items
    .map((item, i) => {
      const y = startY + i * lineH;
      const label = item.subtitle
        ? `${item.title} — ${item.subtitle}`
        : item.title;
      return `<text x="18" y="${y}" class="mono"><tspan class="idx">${i + 1}.</tspan><tspan class="val" dx="8">${escapeXml(truncateText(label, 12, 400))}</tspan></text>`;
    })
    .join("\n  ");

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(headerLabel)}">
  <title>${escapeXml(headerLabel)}</title>
  <style>
    .mono { font: 12px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }
    .idx { fill: ${theme.accent}; }
    .val { fill: ${theme.primaryText}; }
    .bar { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="12" fill="${theme.background}" stroke="${theme.border}" />
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="26" rx="12" fill="${theme.border}" fill-opacity="0.35" />
  <rect x="0.5" y="14" width="${WIDTH - 1}" height="13" fill="${theme.border}" fill-opacity="0.35" />
  <circle cx="18" cy="14" r="5" fill="#ff5f56" />
  <circle cx="34" cy="14" r="5" fill="#ffbd2e" />
  <circle cx="50" cy="14" r="5" fill="#27c93f" />
  <text x="${WIDTH / 2}" y="18" text-anchor="middle" class="bar">${escapeXml(prompt.toUpperCase())}</text>
  ${lines}
</svg>`;
}

function bars(items: RankedItem[], theme: Theme, headerLabel: string): string {
  const headerH = 46;
  const rowH = 34;
  const footerH = 38;
  const barWidth = RIGHT_EDGE - PADDING;
  const barHeight = 8;
  const height = headerH + items.length * rowH + footerH;

  const rows = items
    .map((item, i) => {
      const y = headerH + i * rowH;
      const weight = (items.length - i) / items.length;
      const fillWidth = Math.max(6, weight * barWidth);
      const label = escapeXml(truncateText(item.title, 12, barWidth));
      return `<g transform="translate(0, ${y})">
    <text x="${PADDING}" y="10" class="bar-label">${label}</text>
    <rect x="${PADDING}" y="16" width="${barWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${theme.border}" />
    <rect x="${PADDING}" y="16" width="${fillWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${theme.accent}" />
  </g>`;
    })
    .join("\n  ");

  const footerY = headerH + items.length * rowH;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(headerLabel)}">
  <title>${escapeXml(headerLabel)}</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <style>
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
    .bar-label { font: 600 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
  </style>
  ${header(headerLabel, theme, chartIcon(theme.accent))}
  ${rows}
  <line x1="${PADDING}" y1="${footerY + 8}" x2="${RIGHT_EDGE}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${brandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

function compact(items: RankedItem[], theme: Theme, headerLabel: string): string {
  const headerH = 42;
  const rowH = 40;
  const footerH = 34;
  const artSize = 28;
  const contentX = 56;
  const height = headerH + items.length * rowH + footerH;

  const rows = items
    .map((item, i) => {
      const y = headerH + i * rowH;
      const name = escapeXml(truncateText(item.title, 12, RIGHT_EDGE - contentX));
      const isLast = i === items.length - 1;
      return `<g transform="translate(0, ${y})">
    <g filter="url(#thumbShadow)">
      ${item.art ? `<clipPath id="cp${i}"><rect x="${PADDING}" y="6" width="${artSize}" height="${artSize}" rx="8" /></clipPath>
      <image href="${item.art}" x="${PADDING}" y="6" width="${artSize}" height="${artSize}" clip-path="url(#cp${i})" preserveAspectRatio="xMidYMid slice" />`
        : `<rect x="${PADDING}" y="6" width="${artSize}" height="${artSize}" rx="8" fill="${theme.border}" />`}
    </g>
    <text x="${contentX}" y="24" class="row-title">${name}</text>
    ${!isLast ? `<line x1="${PADDING}" y1="${rowH}" x2="${RIGHT_EDGE}" y2="${rowH}" stroke="${theme.border}" stroke-opacity="0.35" />` : ""}
  </g>`;
    })
    .join("\n  ");

  const footerY = headerH + items.length * rowH;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(headerLabel)}">
  <title>${escapeXml(headerLabel)}</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="16" fill="${theme.background}" stroke="${theme.border}" />
  <defs>
    ${thumbShadowFilter()}
    <style>
      .status { font: 700 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.2px; }
      .row-title { font: 600 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
    </style>
  </defs>
  <text x="${PADDING}" y="26" class="status">${escapeXml(headerLabel.toUpperCase())}</text>
  ${rows}
  <line x1="${PADDING}" y1="${footerY + 6}" x2="${RIGHT_EDGE}" y2="${footerY + 6}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${brandFooter(theme, PADDING, footerY + 12)}
</svg>`;
}

function chartIcon(accent: string): string {
  return `<g transform="translate(11, 6)">
    <rect x="0" y="6" width="3" height="4" rx="1" fill="${accent}" />
    <rect x="4.5" y="3" width="3" height="7" rx="1" fill="${accent}" />
    <rect x="9" y="0" width="3" height="10" rx="1" fill="${accent}" />
  </g>`;
}
