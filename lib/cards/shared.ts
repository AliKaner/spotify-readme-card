import type { Theme } from "../themes";

export interface OverlayStop {
  offset: number;
  opacity: number;
}

export interface GradientDirection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Blurred album-art backdrop + readability overlay + card border, shared by
 * every card so they read as one visual family. Returns markup meant to be
 * inserted right after the opening <svg> tag.
 */
export function cardBackdrop(opts: {
  theme: Theme;
  width: number;
  height: number;
  radius: number;
  albumArt: string | null;
  overlayStops: OverlayStop[];
  gradientDirection?: GradientDirection;
  blurStdDev?: number;
  imageOpacity?: number;
}): string {
  const { theme, width, height, radius, albumArt, overlayStops, blurStdDev = 26, imageOpacity = 0.85 } = opts;
  const dir = opts.gradientDirection ?? { x1: 0, y1: 0, x2: 1, y2: 0 };
  const stops = overlayStops
    .map((s) => `<stop offset="${s.offset}" stop-color="${theme.background}" stop-opacity="${s.opacity}" />`)
    .join("");

  return `<defs>
    <clipPath id="cardClip"><rect width="${width}" height="${height}" rx="${radius}" /></clipPath>
    <filter id="bgBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${blurStdDev}" />
    </filter>
    <linearGradient id="overlay" x1="${dir.x1}" y1="${dir.y1}" x2="${dir.x2}" y2="${dir.y2}">
      ${stops}
    </linearGradient>
  </defs>
  <g clip-path="url(#cardClip)">
    <rect width="${width}" height="${height}" fill="${theme.background}" />
    ${albumArt ? `<image href="${albumArt}" x="-40" y="-40" width="${width + 80}" height="${height + 80}" preserveAspectRatio="xMidYMid slice" filter="url(#bgBlur)" opacity="${imageOpacity}" />` : ""}
    <rect width="${width}" height="${height}" fill="url(#overlay)" />
  </g>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${radius}" fill="none" stroke="${theme.border}" />`;
}

export function thumbShadowFilter(): string {
  return `<filter id="thumbShadow" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.4" />
  </filter>`;
}

export function spotifyGlyph(accent: string, background: string): string {
  return `<circle cx="8" cy="8" r="8" fill="${accent}" />
  <path d="M4.2 6.6c2.4-.7 5.7-.55 7.9.7" stroke="${background}" stroke-width="1.1" stroke-linecap="round" fill="none" />
  <path d="M4.2 9c2.1-.55 4.9-.45 6.9.65" stroke="${background}" stroke-width="1.1" stroke-linecap="round" fill="none" />
  <path d="M4.5 11.3c1.7-.4 3.9-.3 5.5.6" stroke="${background}" stroke-width="1" stroke-linecap="round" fill="none" />`;
}

export function brandFooter(theme: Theme, x: number, y: number): string {
  return `<g transform="translate(${x}, ${y})" opacity="0.85">
    ${spotifyGlyph(theme.accent, theme.background)}
    <text x="21" y="12" class="brand">SPOTIFY</text>
  </g>`;
}

/** Equalizer-bar mark (matches components/Logo.tsx) for cards with no third-party data source. */
export function appGlyph(accent: string): string {
  return `<rect x="0" y="9" width="3" height="5" rx="1" fill="${accent}" />
  <rect x="4.5" y="5" width="3" height="9" rx="1" fill="${accent}" />
  <rect x="9" y="7" width="3" height="7" rx="1" fill="${accent}" />`;
}

export function appBrandFooter(theme: Theme, x: number, y: number): string {
  return `<g transform="translate(${x}, ${y})" opacity="0.85">
    ${appGlyph(theme.accent)}
    <text x="18" y="12" class="brand">README CARDS</text>
  </g>`;
}
