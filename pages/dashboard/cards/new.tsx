import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { requireConvexSession } from "../../../lib/auth/requireConvexSession";
import { api } from "../../../convex/_generated/api";
import { themes } from "../../../lib/themes";

interface Props {
  spotifyConnected: boolean;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const result = await requireConvexSession(ctx);
  if ("redirect" in result) return result;

  const connection = await result.client.query(api.connections.getForCurrentUser, { provider: "spotify" });

  return { props: { spotifyConnected: Boolean(connection) } };
};

const THEME_OPTIONS = Object.keys(themes);
const fieldStyle = { display: "block", width: "100%", marginTop: 4, padding: 8 };

export default function NewCard({ spotifyConnected }: Props) {
  const router = useRouter();
  const [type, setType] = useState<"now-playing" | "top-tracks">("now-playing");
  const [theme, setTheme] = useState("default");
  const [timeRange, setTimeRange] = useState("short_term");
  const [limit, setLimit] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!spotifyConnected) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
        <p>
          Connect Spotify from the <a href="/dashboard">dashboard</a> before creating a card.
        </p>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const config = type === "top-tracks" ? { time_range: timeRange, limit } : {};

    const response = await fetch("/api/cards", {
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
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 22, marginBottom: 24 }}>New card</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 16 }}>
          Card type
          <select value={type} onChange={(e) => setType(e.target.value as "now-playing" | "top-tracks")} style={fieldStyle}>
            <option value="now-playing">Now Playing</option>
            <option value="top-tracks">Top Tracks</option>
          </select>
        </label>

        <label style={{ display: "block", marginBottom: 16 }}>
          Theme
          <select value={theme} onChange={(e) => setTheme(e.target.value)} style={fieldStyle}>
            {THEME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        {type === "top-tracks" && (
          <>
            <label style={{ display: "block", marginBottom: 16 }}>
              Time range
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={fieldStyle}>
                <option value="short_term">Last 4 weeks</option>
                <option value="medium_term">Last 6 months</option>
                <option value="long_term">All time</option>
              </select>
            </label>

            <label style={{ display: "block", marginBottom: 16 }}>
              Number of tracks
              <input
                type="number"
                min={1}
                max={10}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                style={fieldStyle}
              />
            </label>
          </>
        )}

        {error && <p style={{ color: "#e5484d", marginBottom: 16 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 18px",
            background: "#1db954",
            color: "#000",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {submitting ? "Creating…" : "Create card"}
        </button>
      </form>
    </main>
  );
}
