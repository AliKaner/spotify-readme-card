import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appBrandFooter, thumbShadowFilter } from "./shared";
import { resolveSocialPlatform } from "./socialPlatforms";

export interface SocialData {
  platform: string;
  handle: string;
  followers?: number;
}

const WIDTH = 480;
const HEIGHT = 120;
const CONTENT_X = 72;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function buildSocialCard(social: SocialData, theme: Theme): string {
  const def = resolveSocialPlatform(social.platform);
  const accent = def.color ?? theme.accent;
  const handle = escapeXml(truncateText(social.handle.startsWith("@") ? social.handle : `@${social.handle}`, 20, 380));
  const platform = escapeXml(def.label.toUpperCase());
  const followers = social.followers != null ? `${formatCount(social.followers)} followers` : "";
  const pillWidth = Math.round(platform.length * 6.6 + 24);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${handle} on ${platform}">
  <title>${handle} — ${platform}</title>
  <defs>
    ${thumbShadowFilter()}
    <style>
      .handle { font: 700 20px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .followers { font: 400 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .status { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${accent}; letter-spacing: 1px; }
      .brand { font: 600 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1.2px; }
    </style>
  </defs>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="18" fill="${theme.background}" stroke="${theme.border}" />
  <g filter="url(#thumbShadow)">
    <rect x="20" y="20" width="40" height="40" rx="14" fill="${accent}" fill-opacity="0.16" />
  </g>
  <rect x="20.5" y="20.5" width="39" height="39" rx="14" fill="none" stroke="${accent}" stroke-opacity="0.4" />
  <g transform="translate(30, 30)" color="${accent}">${def.icon}</g>
  <g transform="translate(${CONTENT_X}, 20)">
    <rect width="${pillWidth}" height="22" rx="11" fill="${accent}" fill-opacity="0.16" />
    <text x="12" y="15" class="status">${platform}</text>
  </g>
  <text x="${CONTENT_X}" y="72" class="handle">${handle}</text>
  ${followers ? `<text x="${CONTENT_X}" y="92" class="followers">${escapeXml(followers)}</text>` : ""}
  ${appBrandFooter(theme, WIDTH - 132, HEIGHT - 30)}
</svg>`;
}
