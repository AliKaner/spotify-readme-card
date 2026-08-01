import type { AudioFeaturesAverage } from "../spotify";
import type { Theme } from "../themes";
import { brandFooter } from "./shared";

const WIDTH = 330;
const PADDING = 16;
const HEADER_HEIGHT = 46;
const ROW_HEIGHT = 34;
const STAT_HEIGHT = 44;
const FOOTER_HEIGHT = 38;
const RADIUS = 18;
const RIGHT_EDGE = WIDTH - PADDING;
const BAR_WIDTH = RIGHT_EDGE - PADDING;
const BAR_HEIGHT = 8;

interface Metric {
  label: string;
  value: number; // 0-1
}

export function buildSonicProfileCard(features: AudioFeaturesAverage | null, theme: Theme): string {
  if (!features) return buildEmptyCard(theme);

  const metrics: Metric[] = [
    { label: "Energy", value: features.energy },
    { label: "Danceability", value: features.danceability },
    { label: "Positivity", value: features.valence },
  ];

  const height = HEADER_HEIGHT + metrics.length * ROW_HEIGHT + STAT_HEIGHT + FOOTER_HEIGHT;
  const pillLabel = "SONIC PROFILE";
  const pillWidth = Math.round(pillLabel.length * 7.4 + 44);

  const rows = metrics
    .map((m, i) => {
      const y = HEADER_HEIGHT + i * ROW_HEIGHT;
      const fillWidth = Math.max(6, m.value * BAR_WIDTH);
      const pct = Math.round(m.value * 100);
      return `<g transform="translate(0, ${y})">
    <text x="${PADDING}" y="10" class="metric-label">${m.label}</text>
    <text x="${RIGHT_EDGE}" y="10" text-anchor="end" class="metric-pct">${pct}%</text>
    <rect x="${PADDING}" y="16" width="${BAR_WIDTH}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${theme.border}" />
    <rect x="${PADDING}" y="16" width="${fillWidth}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${theme.accent}" />
  </g>`;
    })
    .join("\n  ");

  const statY = HEADER_HEIGHT + metrics.length * ROW_HEIGHT;
  const bpm = Math.round(features.tempo);
  const footerY = statY + STAT_HEIGHT;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sonic profile">
  <title>Sonic Profile</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="${RADIUS}" fill="${theme.background}" stroke="${theme.border}" />
  <style>
    .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.4px; }
    .metric-label { font: 600 12px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
    .metric-pct { font: 600 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
    .bpm-value { font: 700 20px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; }
    .bpm-label { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
    .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
  </style>

  <g transform="translate(${PADDING}, 16)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${theme.accent}" fill-opacity="0.16" />
    ${waveIcon(theme.accent)}
    <text x="26" y="15" class="status">${pillLabel}</text>
  </g>

  ${rows}

  <text x="${PADDING}" y="${statY + 28}"><tspan class="bpm-value">${bpm}</tspan><tspan class="bpm-label" dx="6">BPM AVG TEMPO</tspan></text>

  <line x1="${PADDING}" y1="${footerY + 8}" x2="${RIGHT_EDGE}" y2="${footerY + 8}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${brandFooter(theme, PADDING, footerY + 16)}
</svg>`;
}

function waveIcon(accent: string): string {
  return `<g transform="translate(11, 6)">
    <path d="M0 5 Q2 0 4 5 T8 5 T12 5" fill="none" stroke="${accent}" stroke-width="1.3" stroke-linecap="round" />
  </g>`;
}

function buildEmptyCard(theme: Theme): string {
  const height = 100;
  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No sonic profile available">
  <style>
    .msg { font: 500 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="${RADIUS}" fill="${theme.background}" stroke="${theme.border}" />
  <text x="${WIDTH / 2}" y="${height / 2 + 5}" text-anchor="middle" class="msg">No sonic profile available yet</text>
</svg>`;
}
