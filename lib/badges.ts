import type { GithubProfile, GithubRepo } from "./github";

export type BadgeIcon =
  | "star"
  | "trophy"
  | "flame"
  | "moon"
  | "repeat"
  | "globe"
  | "book"
  | "users"
  | "calendar"
  | "code";

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: BadgeIcon;
}

export function computeGithubBadges(profile: GithubProfile, repos: GithubRepo[]): Badge[] {
  const badges: Badge[] = [];
  const accountAgeYears = (Date.now() - new Date(profile.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000);

  if (accountAgeYears >= 10) {
    badges.push({ id: "decade-club", label: "10 Years on GitHub", description: "A GitHub member for over a decade.", icon: "calendar" });
  } else if (accountAgeYears >= 5) {
    badges.push({ id: "veteran", label: "5 Years on GitHub", description: "A GitHub member for over 5 years.", icon: "calendar" });
  } else if (accountAgeYears >= 1) {
    badges.push({ id: "one-year", label: "1 Year on GitHub", description: "A GitHub member for over a year.", icon: "calendar" });
  }

  if (profile.publicRepos >= 500) {
    badges.push({ id: "prolific", label: "Prolific Builder", description: "500+ public repositories.", icon: "code" });
  } else if (profile.publicRepos >= 100) {
    badges.push({ id: "century-club", label: "Century Club", description: "100+ public repositories.", icon: "code" });
  } else if (profile.publicRepos >= 20) {
    badges.push({ id: "builder", label: "Builder", description: "20+ public repositories.", icon: "code" });
  }

  if (profile.followers >= 1000) {
    badges.push({ id: "influencer", label: "Influencer", description: "1,000+ GitHub followers.", icon: "users" });
  } else if (profile.followers >= 100) {
    badges.push({ id: "popular", label: "Popular", description: "100+ GitHub followers.", icon: "users" });
  }

  const totalStars = repos.reduce((sum, r) => sum + (r.isFork ? 0 : r.stars), 0);
  if (totalStars >= 500) {
    badges.push({ id: "star-magnet", label: "Star Magnet", description: "500+ stars across your repos.", icon: "star" });
  } else if (totalStars >= 50) {
    badges.push({ id: "open-sourcerer", label: "Open Sourcerer", description: "50+ stars across your repos.", icon: "star" });
  }

  const languages = new Set(repos.filter((r) => !r.isFork && r.language).map((r) => r.language));
  if (languages.size >= 8) {
    badges.push({ id: "polyglot-master", label: "Polyglot", description: `Ships code in ${languages.size}+ languages.`, icon: "globe" });
  } else if (languages.size >= 4) {
    badges.push({ id: "multilingual", label: "Multilingual Dev", description: `Codes in ${languages.size}+ languages.`, icon: "globe" });
  }

  if (repos.some((r) => !r.isFork && r.forks >= 20)) {
    badges.push({ id: "trendsetter", label: "Trendsetter", description: "One of your repos has 20+ forks.", icon: "trophy" });
  }

  return badges;
}

export function computeSpotifyBadges(args: {
  topGenreCount: number;
  playlistCount: number;
  sameTopArtistAcrossRanges: boolean;
  nightOwlRatio: number;
}): Badge[] {
  const badges: Badge[] = [];

  if (args.topGenreCount >= 8) {
    badges.push({ id: "genre-explorer", label: "Genre Explorer", description: "8+ distinct genres in your top artists.", icon: "globe" });
  } else if (args.topGenreCount >= 4) {
    badges.push({ id: "genre-curious", label: "Genre Curious", description: "4+ distinct genres in your top artists.", icon: "globe" });
  }

  if (args.playlistCount >= 20) {
    badges.push({ id: "playlist-architect", label: "Playlist Architect", description: "20+ playlists on Spotify.", icon: "book" });
  } else if (args.playlistCount >= 5) {
    badges.push({ id: "playlist-curator", label: "Playlist Curator", description: "5+ playlists on Spotify.", icon: "book" });
  }

  if (args.sameTopArtistAcrossRanges) {
    badges.push({ id: "loyal-listener", label: "Loyal Listener", description: "Same #1 artist over 4 weeks and all-time.", icon: "repeat" });
  }

  if (args.nightOwlRatio >= 0.5) {
    badges.push({ id: "night-owl", label: "Night Owl", description: "Mostly listens late at night.", icon: "moon" });
  }

  return badges;
}
