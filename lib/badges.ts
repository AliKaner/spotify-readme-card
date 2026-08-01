import type { GithubProfile, GithubRepo } from "./github";

export type BadgeIcon = "star" | "trophy" | "moon" | "repeat" | "globe" | "book" | "users" | "calendar" | "code";

export type BadgeSource = "github" | "spotify";
export type BadgeTier = "bronze" | "silver" | "gold";

export interface BadgeDef {
  id: string;
  label: string;
  /** Shown for locked badges too — always phrased as the unlock condition. */
  description: string;
  icon: BadgeIcon;
  source: BadgeSource;
  tier?: BadgeTier;
}

export interface Badge extends BadgeDef {
  earned: boolean;
  /** e.g. "42/100 repos" — only set when it helps explain how close the user is. */
  progress?: string;
}

interface TierRule<T> {
  tier: BadgeTier;
  id: string;
  label: string;
  description: string;
  test: (v: T) => boolean;
}

// Highest tier that matches wins; only that one badge is included per family.
function evaluateTiers<T>(value: T, icon: BadgeIcon, source: BadgeSource, rules: TierRule<T>[], progress?: string): Badge[] {
  const order: BadgeTier[] = ["gold", "silver", "bronze"];
  for (const tier of order) {
    const rule = rules.find((r) => r.tier === tier);
    if (rule && rule.test(value)) {
      return [{ id: rule.id, label: rule.label, description: rule.description, icon, source, tier, earned: true, progress }];
    }
  }
  // Nothing earned yet — show the lowest (bronze) tier as the locked goal.
  const bronze = rules.find((r) => r.tier === "bronze")!;
  return [{ id: bronze.id, label: bronze.label, description: bronze.description, icon, source, tier: "bronze", earned: false, progress }];
}

export function computeGithubBadges(profile: GithubProfile, repos: GithubRepo[]): Badge[] {
  const badges: Badge[] = [];
  const accountAgeYears = (Date.now() - new Date(profile.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000);

  badges.push(
    ...evaluateTiers(
      accountAgeYears,
      "calendar",
      "github",
      [
        { tier: "bronze", id: "one-year", label: "1 Year on GitHub", description: "Be a GitHub member for 1+ year.", test: (v) => v >= 1 },
        { tier: "silver", id: "veteran", label: "5 Years on GitHub", description: "Be a GitHub member for 5+ years.", test: (v) => v >= 5 },
        { tier: "gold", id: "decade-club", label: "10 Years on GitHub", description: "Be a GitHub member for 10+ years.", test: (v) => v >= 10 },
      ],
      `${accountAgeYears.toFixed(1)} yrs`
    )
  );

  badges.push(
    ...evaluateTiers(
      profile.publicRepos,
      "code",
      "github",
      [
        { tier: "bronze", id: "builder", label: "Builder", description: "Have 20+ public repositories.", test: (v) => v >= 20 },
        { tier: "silver", id: "century-club", label: "Century Club", description: "Have 100+ public repositories.", test: (v) => v >= 100 },
        { tier: "gold", id: "prolific", label: "Prolific Builder", description: "Have 500+ public repositories.", test: (v) => v >= 500 },
      ],
      `${profile.publicRepos} repos`
    )
  );

  badges.push(
    ...evaluateTiers(
      profile.followers,
      "users",
      "github",
      [
        { tier: "bronze", id: "noticed", label: "Noticed", description: "Reach 25+ GitHub followers.", test: (v) => v >= 25 },
        { tier: "silver", id: "popular", label: "Popular", description: "Reach 100+ GitHub followers.", test: (v) => v >= 100 },
        { tier: "gold", id: "influencer", label: "Influencer", description: "Reach 1,000+ GitHub followers.", test: (v) => v >= 1000 },
      ],
      `${profile.followers} followers`
    )
  );

  const totalStars = repos.reduce((sum, r) => sum + (r.isFork ? 0 : r.stars), 0);
  badges.push(
    ...evaluateTiers(
      totalStars,
      "star",
      "github",
      [
        { tier: "bronze", id: "open-sourcerer", label: "Open Sourcerer", description: "Earn 50+ stars across your repos.", test: (v) => v >= 50 },
        { tier: "silver", id: "star-magnet", label: "Star Magnet", description: "Earn 500+ stars across your repos.", test: (v) => v >= 500 },
        { tier: "gold", id: "constellation", label: "Constellation", description: "Earn 2,000+ stars across your repos.", test: (v) => v >= 2000 },
      ],
      `${totalStars} stars`
    )
  );

  const languageCount = new Set(repos.filter((r) => !r.isFork && r.language).map((r) => r.language)).size;
  badges.push(
    ...evaluateTiers(
      languageCount,
      "globe",
      "github",
      [
        { tier: "bronze", id: "multilingual", label: "Multilingual Dev", description: "Code in 4+ different languages.", test: (v) => v >= 4 },
        { tier: "silver", id: "polyglot", label: "Polyglot", description: "Code in 8+ different languages.", test: (v) => v >= 8 },
        { tier: "gold", id: "polyglot-master", label: "Language Omnivore", description: "Code in 12+ different languages.", test: (v) => v >= 12 },
      ],
      `${languageCount} languages`
    )
  );

  const maxForks = Math.max(0, ...repos.filter((r) => !r.isFork).map((r) => r.forks));
  badges.push(
    ...evaluateTiers(
      maxForks,
      "trophy",
      "github",
      [
        { tier: "bronze", id: "trendsetter", label: "Trendsetter", description: "Get 20+ forks on a single repo.", test: (v) => v >= 20 },
        { tier: "silver", id: "widely-forked", label: "Widely Forked", description: "Get 100+ forks on a single repo.", test: (v) => v >= 100 },
        { tier: "gold", id: "reference-project", label: "Reference Project", description: "Get 500+ forks on a single repo.", test: (v) => v >= 500 },
      ],
      `${maxForks} forks`
    )
  );

  return badges;
}

export function computeSpotifyBadges(args: {
  topGenreCount: number;
  playlistCount: number;
  sameTopArtistAcrossRanges: boolean;
  nightOwlRatio: number;
}): Badge[] {
  const badges: Badge[] = [];

  badges.push(
    ...evaluateTiers(
      args.topGenreCount,
      "globe",
      "spotify",
      [
        { tier: "bronze", id: "genre-curious", label: "Genre Curious", description: "Have 4+ distinct genres in your top artists.", test: (v) => v >= 4 },
        { tier: "silver", id: "genre-explorer", label: "Genre Explorer", description: "Have 8+ distinct genres in your top artists.", test: (v) => v >= 8 },
        { tier: "gold", id: "genre-omnivore", label: "Genre Omnivore", description: "Have 15+ distinct genres in your top artists.", test: (v) => v >= 15 },
      ],
      `${args.topGenreCount} genres`
    )
  );

  badges.push(
    ...evaluateTiers(
      args.playlistCount,
      "book",
      "spotify",
      [
        { tier: "bronze", id: "playlist-curator", label: "Playlist Curator", description: "Have 5+ playlists on Spotify.", test: (v) => v >= 5 },
        { tier: "silver", id: "playlist-architect", label: "Playlist Architect", description: "Have 20+ playlists on Spotify.", test: (v) => v >= 20 },
        { tier: "gold", id: "playlist-hoarder", label: "Playlist Hoarder", description: "Have 50+ playlists on Spotify.", test: (v) => v >= 50 },
      ],
      `${args.playlistCount} playlists`
    )
  );

  badges.push({
    id: "loyal-listener",
    label: "Loyal Listener",
    description: "Have the same #1 artist over the last 4 weeks and all-time.",
    icon: "repeat",
    source: "spotify",
    earned: args.sameTopArtistAcrossRanges,
  });

  badges.push({
    id: "night-owl",
    label: "Night Owl",
    description: "Have most of your recent listens happen after midnight.",
    icon: "moon",
    source: "spotify",
    earned: args.nightOwlRatio >= 0.5,
    progress: `${Math.round(args.nightOwlRatio * 100)}% late-night`,
  });

  return badges;
}
