import type { Theme } from "../../themes";
import { escapeXml, truncateText } from "../../text";

export type AggregateStatGenericLayout = "terminal" | "radial" | "badge" | "tiles" | "portrait";

export interface StatMetric {
  label: string;
  value: number; // 0-1
}

export interface AggregateStatData {
  metrics: StatMetric[];
  statNumber?: { value: number; label: string };
}

const WIDTH = 330;
const PADDING = 16;

export function renderAggregateStatLayout(
  layout: AggregateStatGenericLayout,
  data: AggregateStatData,
  theme: Theme,
  headerLabel: string
): string {
  if (data.metrics.length === 0) return emptyCard(theme, headerLabel);

  switch (layout) {
    case "terminal":
      return terminal(data, theme, headerLabel);
    case "radial":
      return radial(data, theme, headerLabel);
    case "badge":
      return badge(data, theme, headerLabel);
    case "tiles":
      return tiles(data, theme, headerLabel);
    default:
      return portrait(data, theme, headerLabel);
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

function terminal(data: AggregateStatData, theme: Theme, headerLabel: string): string {
  const lineH = 20;
  const startY = 52;
  const extra = data.statNumber ? 1 : 0;
  const HEIGHT = startY + (data.metrics.length + extra) * lineH + 16;
  const maxLabelLen = Math.max(...data.metrics.map((m) => m.label.length), 4);

  const lines = data.metrics
    .map((m, i) => {
      const y = startY + i * lineH;
      const key = escapeXml(m.label.toLowerCase().padEnd(maxLabelLen, " "));
      return `<text x="18" y="${y}" class="mono"><tspan class="key">${key}</tspan><tspan class="val" dx="10">${Math.round(m.value * 100)}%</tspan></text>`;
    })
    .join("\n  ");

  const statLine = data.statNumber
    ? `<text x="18" y="${startY + data.metrics.length * lineH}" class="mono"><tspan class="key">${escapeXml(data.statNumber.label.toLowerCase())}</tspan><tspan class="val" dx="10">${Math.round(data.statNumber.value)}</tspan></text>`
    : "";

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(headerLabel)}">
  <title>${escapeXml(headerLabel)}</title>
  <style>
    .mono { font: 12px 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }
    .key { fill: ${theme.secondaryText}; }
    .val { fill: ${theme.accent}; }
    .bar { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="12" fill="${theme.background}" stroke="${theme.border}" />
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="26" rx="12" fill="${theme.border}" fill-opacity="0.35" />
  <rect x="0.5" y="14" width="${WIDTH - 1}" height="13" fill="${theme.border}" fill-opacity="0.35" />
  <circle cx="18" cy="14" r="5" fill="#ff5f56" />
  <circle cx="34" cy="14" r="5" fill="#ffbd2e" />
  <circle cx="50" cy="14" r="5" fill="#27c93f" />
  <text x="${WIDTH / 2}" y="18" text-anchor="middle" class="bar">${escapeXml(headerLabel.toUpperCase())}</text>
  ${lines}
  ${statLine}
</svg>`;
}

function radial(data: AggregateStatData, theme: Theme, headerLabel: string): string {
  const HEIGHT = 168;
  const metrics = data.metrics.slice(0, 4);
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const gap = WIDTH / metrics.length;

  const rings = metrics
    .map((m, i) => {
      const cx = gap * i + gap / 2;
      const cy = 78;
      const dash = Math.max(1, m.value * circumference);
      const label = escapeXml(truncateText(m.label, 10, gap - 8));
      return `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${theme.border}" stroke-width="6" />
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${theme.accent}" stroke-width="6" stroke-linecap="round"
      stroke-dasharray="${dash} ${circumference}" transform="rotate(-90 ${cx} ${cy})" />
    <text x="${cx}" y="${cy + 5}" text-anchor="middle" class="pct">${Math.round(m.value * 100)}%</text>
    <text x="${cx}" y="${cy + r + 20}" text-anchor="middle" class="label">${label}</text>
  </g>`;
    })
    .join("\n  ");

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(headerLabel)}">
  <title>${escapeXml(headerLabel)}</title>
  <style>
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
    .pct { font: 700 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .label { font: 500 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; text-transform: capitalize; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${PADDING}" y="28" class="status">${escapeXml(headerLabel.toUpperCase())}</text>
  ${rings}
</svg>`;
}

function badge(data: AggregateStatData, theme: Theme, headerLabel: string): string {
  const HEIGHT = 40;
  const summary = data.metrics.map((m) => `${m.label} ${Math.round(m.value * 100)}%`).join(" · ");
  const text = escapeXml(truncateText(summary, 11, 380));

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(headerLabel)}">
  <title>${escapeXml(headerLabel)}</title>
  <style>.label { font: 600 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; text-transform: capitalize; }</style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="${HEIGHT / 2}" fill="${theme.background}" stroke="${theme.border}" />
  <circle cx="18" cy="${HEIGHT / 2}" r="4" fill="${theme.accent}" />
  <text x="30" y="${HEIGHT / 2 + 4}" class="label">${text}</text>
</svg>`;
}

function tiles(data: AggregateStatData, theme: Theme, headerLabel: string): string {
  const metrics = data.statNumber
    ? [...data.metrics, { label: data.statNumber.label, value: -1, raw: data.statNumber.value }]
    : data.metrics.map((m) => ({ ...m, raw: undefined as number | undefined }));
  const columns = 2;
  const rows = Math.ceil(metrics.length / columns);
  const gap = 10;
  const headerH = 46;
  const tileSize = (WIDTH - PADDING * 2 - gap * (columns - 1)) / columns;
  const tileHeight = 64;
  const height = headerH + rows * tileHeight + (rows - 1) * gap + PADDING;

  const cells = metrics
    .map((m: any, i: number) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = PADDING + col * (tileSize + gap);
      const y = headerH + row * (tileHeight + gap);
      const display = m.raw !== undefined ? String(Math.round(m.raw)) : `${Math.round(m.value * 100)}%`;
      const label = escapeXml(truncateText(m.label, 10, tileSize - 16));
      return `<g transform="translate(${x}, ${y})">
    <rect width="${tileSize}" height="${tileHeight}" rx="12" fill="${theme.border}" fill-opacity="0.3" />
    <text x="12" y="30" class="tile-value">${display}</text>
    <text x="12" y="48" class="tile-label">${label}</text>
  </g>`;
    })
    .join("\n  ");

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(headerLabel)}">
  <title>${escapeXml(headerLabel)}</title>
  <style>
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
    .tile-value { font: 700 18px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .tile-label { font: 500 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; text-transform: capitalize; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${PADDING}" y="28" class="status">${escapeXml(headerLabel.toUpperCase())}</text>
  ${cells}
</svg>`;
}

function portrait(data: AggregateStatData, theme: Theme, headerLabel: string): string {
  const WIDTH_P = 220;
  const rowH = 40;
  const startY = 60;
  const extra = data.statNumber ? 1 : 0;
  const HEIGHT = startY + (data.metrics.length + extra) * rowH + 20;
  const barWidth = WIDTH_P - 32;

  const rows = data.metrics
    .map((m, i) => {
      const y = startY + i * rowH;
      const fillWidth = Math.max(4, m.value * barWidth);
      return `<g transform="translate(0, ${y})">
    <text x="16" y="0" class="p-label">${escapeXml(truncateText(m.label, 11, barWidth))}</text>
    <rect x="16" y="8" width="${barWidth}" height="6" rx="3" fill="${theme.border}" />
    <rect x="16" y="8" width="${fillWidth}" height="6" rx="3" fill="${theme.accent}" />
  </g>`;
    })
    .join("\n  ");

  const statRow = data.statNumber
    ? `<g transform="translate(0, ${startY + data.metrics.length * rowH})">
    <text x="16" y="14" class="p-stat">${Math.round(data.statNumber.value)}</text>
    <text x="${16 + String(Math.round(data.statNumber.value)).length * 11 + 8}" y="14" class="p-label">${escapeXml(data.statNumber.label)}</text>
  </g>`
    : "";

  return `<svg width="${WIDTH_P}" height="${HEIGHT}" viewBox="0 0 ${WIDTH_P} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(headerLabel)}">
  <title>${escapeXml(headerLabel)}</title>
  <style>
    .status { font: 700 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.2px; }
    .p-label { font: 500 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; text-transform: capitalize; }
    .p-stat { font: 700 16px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH_P - 1}" height="${HEIGHT - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <text x="16" y="26" class="status">${escapeXml(headerLabel.toUpperCase())}</text>
  ${rows}
  ${statRow}
</svg>`;
}
