import { z } from "zod";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Theme } from "../../themes";
import { createConvexClient } from "../../convexClient";
import { api } from "../../../convex/_generated/api";
import {
  getGithubProfileById,
  getGithubRepos,
  getGithubRecentActivity,
  getGithubRepoInfo,
  getGithubContributors,
  computeTopRepos,
  computeTopLanguages,
} from "../../github";
import { buildGithubStatsCard } from "../../cards/githubStatsCard";
import { buildTopLanguagesCard } from "../../cards/topLanguagesCard";
import { buildGithubReposCard } from "../../cards/githubReposCard";
import { buildGithubActivityCard } from "../../cards/githubActivityCard";
import { buildRepoContributionsCard } from "../../cards/repoContributionsCard";
import { buildGithubTradingCard } from "../../cards/githubTradingCard";
import { buildGithubRpgSheetCard } from "../../cards/githubRpgSheetCard";
import { buildGithubRpgScrollCard } from "../../cards/githubRpgScrollCard";
import { buildGithubReportCard } from "../../cards/githubReportCard";
import { buildGithubDiplomaCard } from "../../cards/githubDiplomaCard";
import { buildRepoPassportCard } from "../../cards/repoPassportCard";
import { buildRepoWantedPosterCard } from "../../cards/repoWantedPosterCard";
import { buildRepoLineupCard } from "../../cards/repoLineupCard";
import { buildRepoMembershipCard } from "../../cards/repoMembershipCard";
import { buildErrorCard } from "../../cards/errorCard";
import { toDataUri } from "../../image";
import { renderRankedListLayout, type RankedItem, type RankedListGenericLayout } from "../../cards/layouts/rankedList";
import { renderAggregateStatLayout, type AggregateStatGenericLayout } from "../../cards/layouts/aggregateStat";
import { renderSingleItemLayout, type SingleItemGenericLayout } from "../../cards/layouts/singleItem";
import type { CardTypeDef, Provider } from "../types";

const SINGLE_ITEM_LAYOUTS = ["full", "compact", "terminal", "badge", "portrait", "split"] as const;
const REPO_NAME_PATTERN = /^[\w.-]+\/[\w.-]+$/;

const statsConfigSchema = z.object({
  layout: z
    .enum([
      "full",
      "terminal",
      "radial",
      "badge",
      "tiles",
      "portrait",
      "trading-card",
      "rpg-sheet",
      "rpg-scroll",
      "report-card",
      "diploma",
    ])
    .default("full"),
});

const languagesConfigSchema = z.object({
  layout: z.enum(["bars", "terminal", "radial", "badge", "tiles", "portrait"]).default("bars"),
});

const reposConfigSchema = z.object({
  layout: z.enum(["list", "grid", "avatars", "terminal", "bars", "compact"]).default("list"),
});

const activityConfigSchema = z.object({
  layout: z.enum(["list", "grid", "avatars", "terminal", "bars", "compact"]).default("list"),
});

const repoContributionsConfigSchema = z.object({
  repo: z.string().regex(REPO_NAME_PATTERN, "Use owner/repo format"),
  layout: z.enum([...SINGLE_ITEM_LAYOUTS, "passport", "wanted-poster", "lineup", "membership"]).default("full"),
});

export const githubCardTypes: CardTypeDef[] = [
  { id: "github-stats", label: "GitHub Stats", configSchema: statsConfigSchema, defaultConfig: { layout: "full" } },
  { id: "top-languages", label: "Top Languages", configSchema: languagesConfigSchema, defaultConfig: { layout: "bars" } },
  { id: "top-repos", label: "Top Repositories", configSchema: reposConfigSchema, defaultConfig: { layout: "list" } },
  { id: "recent-activity", label: "Recent Activity", configSchema: activityConfigSchema, defaultConfig: { layout: "list" } },
  {
    id: "repo-contributions",
    label: "Repo Contributions",
    configSchema: repoContributionsConfigSchema,
    defaultConfig: { repo: "", layout: "full" },
  },
];

async function renderCard(args: {
  userId: Id<"users">;
  type: string;
  theme: Theme;
  config: unknown;
}): Promise<string> {
  const client = createConvexClient();
  const accountId = await client.query(api.githubAccounts.getForUser, { userId: args.userId });
  if (!accountId) return buildErrorCard("GitHub not available");

  const profile = await getGithubProfileById(accountId);
  if (!profile) return buildErrorCard("GitHub profile not found");

  if (args.type === "github-stats") {
    const parsed = statsConfigSchema.parse(args.config ?? {});
    if (parsed.layout === "full") return buildGithubStatsCard(profile, args.theme);

    if (
      parsed.layout === "trading-card" ||
      parsed.layout === "rpg-sheet" ||
      parsed.layout === "rpg-scroll" ||
      parsed.layout === "report-card" ||
      parsed.layout === "diploma"
    ) {
      const [repos, avatar] = await Promise.all([getGithubRepos(profile.login, 100), toDataUri(profile.avatarUrl)]);
      if (parsed.layout === "trading-card") return buildGithubTradingCard(profile, repos, avatar, args.theme);
      if (parsed.layout === "rpg-sheet") return buildGithubRpgSheetCard(profile, repos, avatar, args.theme);
      if (parsed.layout === "rpg-scroll") return buildGithubRpgScrollCard(profile, repos);
      if (parsed.layout === "diploma") return buildGithubDiplomaCard(profile, repos);
      return buildGithubReportCard(profile, repos, avatar, args.theme);
    }

    const years = Math.max(0, (Date.now() - new Date(profile.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000));
    const metrics = [
      { label: "repos", value: Math.min(profile.publicRepos / 100, 1) },
      { label: "followers", value: Math.min(profile.followers / 500, 1) },
      { label: "gists", value: Math.min(profile.publicGists / 20, 1) },
    ];
    return renderAggregateStatLayout(
      parsed.layout as AggregateStatGenericLayout,
      { metrics, statNumber: { value: years, label: "YEARS ON GITHUB" } },
      args.theme,
      "GitHub Stats"
    );
  }

  if (args.type === "top-languages") {
    const parsed = languagesConfigSchema.parse(args.config ?? {});
    const repos = await getGithubRepos(profile.login, 100);
    const languages = computeTopLanguages(repos, 5);
    if (parsed.layout === "bars") return buildTopLanguagesCard(languages, args.theme);

    const maxCount = Math.max(1, ...languages.map((l) => l.count));
    const metrics = languages.map((l) => ({ label: l.language, value: l.count / maxCount }));
    return renderAggregateStatLayout(parsed.layout as AggregateStatGenericLayout, { metrics }, args.theme, "Top Languages");
  }

  if (args.type === "top-repos") {
    const parsed = reposConfigSchema.parse(args.config ?? {});
    const repos = await getGithubRepos(profile.login, 100);
    const top = computeTopRepos(repos, 5);
    if (parsed.layout === "list") return buildGithubReposCard(top, args.theme);

    const items: RankedItem[] = top.map((r) => ({ title: r.name, subtitle: `${r.stars} stars`, art: null }));
    return renderRankedListLayout(parsed.layout as RankedListGenericLayout, items, args.theme, "Top Repositories");
  }

  if (args.type === "recent-activity") {
    const parsed = activityConfigSchema.parse(args.config ?? {});
    const activity = await getGithubRecentActivity(profile.login, 5);
    if (parsed.layout === "list") return buildGithubActivityCard(activity, args.theme);

    const items: RankedItem[] = activity.map((a) => ({ title: a.message, subtitle: a.repo, art: null }));
    return renderRankedListLayout(parsed.layout as RankedListGenericLayout, items, args.theme, "Recent Activity");
  }

  if (args.type === "repo-contributions") {
    const parsed = repoContributionsConfigSchema.parse(args.config ?? {});
    const [owner, name] = parsed.repo.split("/");

    const repoInfo = await getGithubRepoInfo(owner, name);
    if (!repoInfo) return buildErrorCard(`Repository "${parsed.repo}" not found`);

    const contributors = await getGithubContributors(owner, name);
    const index = contributors.findIndex((c) => c.login.toLowerCase() === profile.login.toLowerCase());
    const mine = index >= 0 ? contributors[index] : null;
    const art = await toDataUri(repoInfo.ownerAvatarUrl);

    const data = {
      fullName: repoInfo.fullName,
      contributions: mine?.contributions ?? 0,
      rank: index >= 0 ? index + 1 : null,
      totalContributors: contributors.length,
      description: repoInfo.description,
    };

    if (parsed.layout === "full") return buildRepoContributionsCard(data, art, args.theme);
    if (parsed.layout === "passport") {
      const holderAvatar = await toDataUri(profile.avatarUrl);
      return buildRepoPassportCard(data, holderAvatar, profile.login, args.theme);
    }
    if (parsed.layout === "wanted-poster") {
      const holderAvatar = await toDataUri(profile.avatarUrl);
      return buildRepoWantedPosterCard(data, holderAvatar, profile.login);
    }
    if (parsed.layout === "lineup") {
      const holderAvatar = await toDataUri(profile.avatarUrl);
      return buildRepoLineupCard(data, holderAvatar, profile.login);
    }
    if (parsed.layout === "membership") {
      return buildRepoMembershipCard(data, profile.login, args.theme);
    }
    return renderSingleItemLayout(
      parsed.layout as SingleItemGenericLayout,
      {
        title: `${data.contributions} ${data.contributions === 1 ? "commit" : "commits"}`,
        subtitle: `${repoInfo.fullName} · ${data.rank ? `#${data.rank}` : `${data.totalContributors} total`}`,
        art,
        statusLabel: "Contributor",
        brand: "app",
      },
      args.theme
    );
  }

  throw new Error(`Unknown GitHub card type: ${args.type}`);
}

export const githubProvider: Provider = {
  id: "github",
  displayName: "GitHub",
  status: "live",
  requiresConnection: false,
  cardTypes: githubCardTypes,
  renderCard,
};
