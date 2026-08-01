import type { GithubProfile, GithubRepo } from "../github";

export type AbilityId = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export interface Ability {
  id: AbilityId;
  label: string;
  raw: number;
  value: number; // 0-1 normalized
  score: number; // 8-18, classic D&D range
}

export interface RpgStats {
  abilities: Ability[];
  className: string;
  classColor: string;
  level: number;
  xpProgress: number;
}

const CLASS_BY_ABILITY: Record<AbilityId, string> = {
  STR: "WARRIOR",
  DEX: "ROGUE",
  CON: "BARBARIAN",
  INT: "WIZARD",
  WIS: "CLERIC",
  CHA: "BARD",
};

const CLASS_COLOR: Record<AbilityId, string> = {
  STR: "#ef4444",
  DEX: "#4ade80",
  CON: "#f97316",
  INT: "#818cf8",
  WIS: "#f4c542",
  CHA: "#ec4899",
};

function abilityScore(normalized: number): number {
  return Math.round(8 + Math.min(Math.max(normalized, 0), 1) * 10);
}

export function modifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : String(mod);
}

export function computeRpgStats(profile: GithubProfile, repos: GithubRepo[]): RpgStats {
  const totalStars = repos.reduce((sum, r) => sum + (r.isFork ? 0 : r.stars), 0);
  const languageCount = new Set(repos.filter((r) => !r.isFork && r.language).map((r) => r.language)).size;
  const accountAgeYears = Math.max(0, (Date.now() - new Date(profile.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000));

  const raw: Record<AbilityId, number> = {
    STR: totalStars,
    DEX: languageCount,
    CON: Math.round(accountAgeYears),
    INT: profile.publicRepos,
    WIS: profile.followers,
    CHA: profile.publicGists,
  };
  const normalized: Record<AbilityId, number> = {
    STR: totalStars / 500,
    DEX: languageCount / 10,
    CON: accountAgeYears / 10,
    INT: profile.publicRepos / 200,
    WIS: profile.followers / 1000,
    CHA: profile.publicGists / 30,
  };

  const abilities: Ability[] = (Object.keys(raw) as AbilityId[]).map((id) => ({
    id,
    label: id,
    raw: raw[id],
    value: normalized[id],
    score: abilityScore(normalized[id]),
  }));

  const topAbility = [...abilities].sort((a, b) => b.score - a.score)[0];
  const className = CLASS_BY_ABILITY[topAbility.id];
  const classColor = CLASS_COLOR[topAbility.id];

  const totalScore = abilities.reduce((sum, a) => sum + a.score, 0);
  const level = Math.max(1, Math.min(20, Math.floor((totalScore - 48) / 6) + 1));
  const xpProgress = ((totalScore - 48) % 6) / 6;

  return { abilities, className, classColor, level, xpProgress };
}
