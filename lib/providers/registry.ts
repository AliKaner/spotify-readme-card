import { spotifyProvider } from "./spotify";
import { customProvider } from "./custom";
import { githubProvider } from "./github";
import { achievementsProvider } from "./achievements";
import type { Provider } from "./types";

export const providers: Record<string, Provider> = {
  spotify: spotifyProvider,
  custom: customProvider,
  github: githubProvider,
  achievements: achievementsProvider,
};

export interface MarketplaceEntry {
  id: string;
  displayName: string;
  status: "live" | "coming-soon";
}

// Not implemented yet — listed on the marketplace page as a roadmap preview only.
const COMING_SOON: MarketplaceEntry[] = [
  { id: "wakatime", displayName: "WakaTime", status: "coming-soon" },
  { id: "lastfm", displayName: "Last.fm", status: "coming-soon" },
];

export function listProviders(): MarketplaceEntry[] {
  const live = Object.values(providers).map((p) => ({ id: p.id, displayName: p.displayName, status: p.status }));
  return [...live, ...COMING_SOON];
}

export function getProvider(id: string): Provider | undefined {
  return providers[id];
}
