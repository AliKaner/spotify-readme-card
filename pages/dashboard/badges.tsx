import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useConvexAuth, useAuthToken } from "@convex-dev/auth/react";
import { Star, Trophy, Moon, Repeat, Globe, BookOpen, Users, Calendar, Code2, Lock, ArrowRight } from "lucide-react";
import { authFetch } from "../../lib/authFetch";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LinkButton } from "../../components/ui/Button";
import type { Badge as BadgeData, BadgeIcon, BadgeTier } from "../../lib/badges";

const ICONS: Record<BadgeIcon, typeof Star> = {
  star: Star,
  trophy: Trophy,
  moon: Moon,
  repeat: Repeat,
  globe: Globe,
  book: BookOpen,
  users: Users,
  calendar: Calendar,
  code: Code2,
};

const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: "#cd8a4d",
  silver: "#c8ccd4",
  gold: "#f4c542",
};

export default function BadgesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const token = useAuthToken();

  const [data, setData] = useState<{ badges: BadgeData[]; total: number; earnedCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!token) return;
    authFetch(token, "/api/badges")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to load badges.");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message ?? "Failed to load badges."));
  }, [token]);

  if (isLoading || !isAuthenticated) {
    return (
      <Layout>
        <p className="text-text-muted">Loading…</p>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Badges — README Cards</title>
      </Head>
      <Layout>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Badges</h1>
            <p className="mt-1 text-text-muted">
              Earned from your GitHub activity, and your Spotify listening if you&apos;ve connected it. Showcase them
              with a Badges card.
            </p>
          </div>
          <LinkButton href="/dashboard/cards/new" variant="secondary">
            Add Badges card <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>

        {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

        {!error && !data && <p className="mt-8 text-text-muted">Loading badges…</p>}

        {data && (
          <>
            <p className="mt-6 font-mono text-sm text-text-muted">
              {data.earnedCount} / {data.total} unlocked
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.badges.map((badge) => {
                const Icon = ICONS[badge.icon];
                const ringColor = badge.tier ? TIER_COLORS[badge.tier] : "var(--color-accent)";
                return (
                  <Card
                    key={badge.id}
                    className={`relative flex items-start gap-3 transition ${badge.earned ? "" : "opacity-50"}`}
                    style={badge.earned ? { borderColor: `${ringColor}66` } : undefined}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${ringColor}26`, color: ringColor }}
                    >
                      {badge.earned ? <Icon className="h-5 w-5" /> : <Lock className="h-4.5 w-4.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{badge.label}</h3>
                        {badge.tier && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: ringColor }}>
                            {badge.tier}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-text-muted">{badge.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge tone={badge.source === "github" ? "violet" : "accent"}>
                          {badge.source === "github" ? "GitHub" : "Spotify"}
                        </Badge>
                        {badge.progress && <span className="text-xs text-text-muted">{badge.progress}</span>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </Layout>
    </>
  );
}
