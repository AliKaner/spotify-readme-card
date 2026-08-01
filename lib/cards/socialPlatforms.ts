export type SocialPlatformId =
  | "twitter"
  | "instagram"
  | "github"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "twitch"
  | "discord"
  | "mastodon"
  | "website";

export interface SocialPlatformDef {
  id: SocialPlatformId;
  label: string;
  /** Brand-ish accent color used for this platform's pill/icon; null falls back to the card's theme accent. */
  color: string | null;
  /** SVG markup for a simplified, original glyph inside a 20x20 box (not a literal brand logo). */
  icon: string;
}

// Deliberately abstracted, hand-drawn glyphs (same spirit as the existing spotifyGlyph mark)
// rather than reproductions of each platform's actual logo artwork.
export const SOCIAL_PLATFORMS: SocialPlatformDef[] = [
  {
    id: "twitter",
    label: "Twitter / X",
    color: "#1d9bf0",
    icon: `<path d="M3 3l14 14M17 3L3 17" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />`,
  },
  {
    id: "instagram",
    label: "Instagram",
    color: "#e1306c",
    icon: `<rect x="2.5" y="2.5" width="15" height="15" rx="5" fill="none" stroke="currentColor" stroke-width="1.6" />
      <circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="1.6" />
      <circle cx="14.3" cy="5.7" r="1.1" fill="currentColor" />`,
  },
  {
    id: "github",
    label: "GitHub",
    color: "#c9d1d9",
    icon: `<circle cx="10" cy="11.5" r="6.5" fill="currentColor" />
      <path d="M6 5.5c0-1.8 1.4-3.2 3.2-3.2M14 5.5c0-1.8-1.4-3.2-3.2-3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" />
      <circle cx="7.6" cy="11" r="1" fill="#0b0e14" /><circle cx="12.4" cy="11" r="1" fill="#0b0e14" />`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0a66c2",
    icon: `<rect x="2.5" y="2.5" width="15" height="15" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.6" />
      <circle cx="6.6" cy="6.8" r="1.15" fill="currentColor" />
      <path d="M6.6 9.3v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M10 14.3v-3c0-1.3.9-2 2-2s1.8.7 1.8 2v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none" />
      <path d="M10 9.3v1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />`,
  },
  {
    id: "youtube",
    label: "YouTube",
    color: "#ff0000",
    icon: `<rect x="2" y="4.5" width="16" height="11" rx="4" fill="currentColor" />
      <path d="M8.3 7.8v4.4l4-2.2z" fill="#0b0e14" />`,
  },
  {
    id: "tiktok",
    label: "TikTok",
    color: "#fe2c55",
    icon: `<path d="M11 2.5v9.8a2.6 2.6 0 11-2.2-2.57" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none" />
      <path d="M11 2.5c.2 2 1.7 3.5 3.6 3.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none" />`,
  },
  {
    id: "twitch",
    label: "Twitch",
    color: "#9146ff",
    icon: `<path d="M4 2.5h13v9l-3.2 3.2H10l-2.3 2.3v-2.3H4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M10.2 5.8v3.6M14 5.8v3.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />`,
  },
  {
    id: "discord",
    label: "Discord",
    color: "#5865f2",
    icon: `<path d="M4 13c0-4 1.2-7 1.2-7s2-.9 3.6-.9l.4 1c1-.2 1.6-.2 2.6 0l.4-1c1.6 0 3.6.9 3.6.9S17 9 17 13c0 0-2.1 2-5.5 2l-.6-1.3c-.7.15-1.7.15-2.4 0L7.9 15C4.5 15 4 13 4 13z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      <circle cx="8.3" cy="11.2" r="1.1" fill="currentColor" /><circle cx="11.7" cy="11.2" r="1.1" fill="currentColor" />`,
  },
  {
    id: "mastodon",
    label: "Mastodon",
    color: "#6364ff",
    icon: `<path d="M5.5 3.5h9a2 2 0 012 2v5a2 2 0 01-2 2h-2l-2.5 2.5V12.5h-4.5a2 2 0 01-2-2v-5a2 2 0 012-2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M7.5 6v3M10 6v3.6M12.5 6v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />`,
  },
  {
    id: "website",
    label: "Website",
    color: null,
    icon: `<circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" stroke-width="1.5" />
      <ellipse cx="10" cy="10" rx="3.1" ry="7.2" fill="none" stroke="currentColor" stroke-width="1.5" />
      <line x1="2.8" y1="10" x2="17.2" y2="10" stroke="currentColor" stroke-width="1.5" />`,
  },
];

const ALIASES: Record<string, SocialPlatformId> = {
  x: "twitter",
  twitter: "twitter",
  "twitter/x": "twitter",
  instagram: "instagram",
  ig: "instagram",
  github: "github",
  linkedin: "linkedin",
  youtube: "youtube",
  yt: "youtube",
  tiktok: "tiktok",
  twitch: "twitch",
  discord: "discord",
  mastodon: "mastodon",
  website: "website",
  other: "website",
};

/**
 * Accepts either a known platform id or arbitrary legacy free text (cards created before
 * the platform picker existed) and resolves it to a display definition. Unrecognized text
 * falls back to the generic "website" glyph but keeps the original text as the label.
 */
export function resolveSocialPlatform(raw: string): SocialPlatformDef {
  const key = raw.trim().toLowerCase();
  const id = ALIASES[key];
  if (id) return SOCIAL_PLATFORMS.find((p) => p.id === id)!;

  const generic = SOCIAL_PLATFORMS.find((p) => p.id === "website")!;
  return { ...generic, label: raw.trim() || generic.label };
}
