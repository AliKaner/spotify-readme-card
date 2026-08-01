import { useEffect, useState, type FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useConvexAuth, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authFetch } from "../../../lib/authFetch";
import { themes } from "../../../lib/themes";
import { Layout } from "../../../components/Layout";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

const THEME_OPTIONS = Object.keys(themes);
const fieldClass =
  "mt-1.5 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium";

export default function NewCard() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const token = useAuthToken();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  const connection = useQuery(api.connections.getForCurrentUser, isLoading ? "skip" : { provider: "spotify" });

  const [type, setType] = useState<"now-playing" | "top-tracks">("now-playing");
  const [theme, setTheme] = useState("default");
  const [timeRange, setTimeRange] = useState("short_term");
  const [limit, setLimit] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !isAuthenticated || connection === undefined) {
    return (
      <Layout>
        <p className="text-text-muted">Loading…</p>
      </Layout>
    );
  }

  if (!connection) {
    return (
      <Layout>
        <p className="text-text-muted">
          Connect Spotify from the{" "}
          <a href="/dashboard" className="text-accent underline underline-offset-4">
            dashboard
          </a>{" "}
          before creating a card.
        </p>
      </Layout>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const config = type === "top-tracks" ? { time_range: timeRange, limit } : {};

    const response = await authFetch(token, "/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "spotify", type, theme, config }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Failed to create card.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard/cards");
  }

  return (
    <>
      <Head>
        <title>New card — README Cards</title>
      </Head>
      <Layout>
        <h1 className="text-2xl font-semibold">New card</h1>
        <p className="mt-1 text-text-muted">Pick a card type, a theme, and any options.</p>

        <Card className="mt-8 max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className={labelClass}>
              Card type
              <select value={type} onChange={(e) => setType(e.target.value as "now-playing" | "top-tracks")} className={fieldClass}>
                <option value="now-playing">Now Playing</option>
                <option value="top-tracks">Top Tracks</option>
              </select>
            </label>

            <label className={labelClass}>
              Theme
              <select value={theme} onChange={(e) => setTheme(e.target.value)} className={fieldClass}>
                {THEME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            {type === "top-tracks" && (
              <>
                <label className={labelClass}>
                  Time range
                  <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className={fieldClass}>
                    <option value="short_term">Last 4 weeks</option>
                    <option value="medium_term">Last 6 months</option>
                    <option value="long_term">All time</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Number of tracks
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className={fieldClass}
                  />
                </label>
              </>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating…" : "Create card"}
            </Button>
          </form>
        </Card>
      </Layout>
    </>
  );
}
