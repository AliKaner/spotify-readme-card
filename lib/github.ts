const GITHUB_API = "https://api.github.com";

export interface GithubProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  publicGists: number;
  createdAt: string;
  htmlUrl: string;
}

export interface GithubRepo {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  htmlUrl: string;
  isFork: boolean;
  updatedAt: string;
}

export interface GithubActivity {
  repo: string;
  message: string;
  createdAt: string;
}

export interface LanguageCount {
  language: string;
  count: number;
}

// GitHub's unauthenticated public API is capped at 60 req/hour per IP. Setting an app-level
// GITHUB_TOKEN (a plain PAT, no special scopes needed — this only ever reads public data)
// raises that to 5,000/hour. Entirely optional; falls back to unauthenticated requests.
function githubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "readme-cards-app",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function githubGet(path: string): Promise<any> {
  const response = await fetch(`${GITHUB_API}${path}`, { headers: githubHeaders() });
  if (!response.ok) return null;
  return response.json();
}

export async function getGithubProfileById(accountId: string): Promise<GithubProfile | null> {
  const data = await githubGet(`/user/${accountId}`);
  if (!data) return null;

  return {
    login: data.login,
    name: data.name ?? null,
    avatarUrl: data.avatar_url,
    publicRepos: data.public_repos ?? 0,
    followers: data.followers ?? 0,
    following: data.following ?? 0,
    publicGists: data.public_gists ?? 0,
    createdAt: data.created_at,
    htmlUrl: data.html_url,
  };
}

export async function getGithubRepos(login: string, limit = 100): Promise<GithubRepo[]> {
  const data = await githubGet(`/users/${encodeURIComponent(login)}/repos?sort=updated&per_page=${Math.min(limit, 100)}`);
  if (!Array.isArray(data)) return [];

  return data.map((repo: any) => ({
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    language: repo.language,
    htmlUrl: repo.html_url,
    isFork: Boolean(repo.fork),
    updatedAt: repo.updated_at,
  }));
}

export function computeTopRepos(repos: GithubRepo[], limit = 5): GithubRepo[] {
  return repos
    .filter((r) => !r.isFork)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, limit);
}

export function computeTopLanguages(repos: GithubRepo[], limit = 5): LanguageCount[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (repo.isFork || !repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getGithubRecentActivity(login: string, limit = 5): Promise<GithubActivity[]> {
  const data = await githubGet(`/users/${encodeURIComponent(login)}/events/public?per_page=30`);
  if (!Array.isArray(data)) return [];

  const activity: GithubActivity[] = [];
  for (const event of data) {
    if (event.type !== "PushEvent") continue;
    const commits = event.payload?.commits ?? [];
    for (const commit of commits) {
      activity.push({
        repo: event.repo?.name?.split("/")?.[1] ?? event.repo?.name ?? "repo",
        message: (commit.message ?? "").split("\n")[0],
        createdAt: event.created_at,
      });
      if (activity.length >= limit) return activity;
    }
  }
  return activity;
}
