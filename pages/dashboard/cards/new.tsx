import { useEffect, useRef, useState, type FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useConvexAuth, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { authFetch } from "../../../lib/authFetch";
import { themes } from "../../../lib/themes";
import { Layout } from "../../../components/Layout";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { SpotifySearchPicker, type PickerItem, type PickerType } from "../../../components/SpotifySearchPicker";

type CardType =
  | "now-playing"
  | "top-tracks"
  | "top-artists"
  | "recently-played"
  | "top-genres"
  | "sonic-profile"
  | "featured-track"
  | "featured-artist"
  | "featured-playlist";

const FEATURED_PICKER_TYPE: Partial<Record<CardType, PickerType>> = {
  "featured-track": "track",
  "featured-artist": "artist",
  "featured-playlist": "playlist",
};
type NowPlayingLayout = "full" | "compact";
type TracksLayout = "list" | "grid";
type TimeRangeId = "short_term" | "medium_term" | "long_term";

const THEME_OPTIONS = Object.keys(themes);

const TYPE_OPTIONS: { id: CardType; label: string }[] = [
  { id: "now-playing", label: "Now Playing" },
  { id: "top-tracks", label: "Top Tracks" },
  { id: "top-artists", label: "Top Artists" },
  { id: "recently-played", label: "Recently Played" },
  { id: "top-genres", label: "Top Genres" },
  { id: "sonic-profile", label: "Sonic Profile" },
  { id: "featured-track", label: "Featured Track" },
  { id: "featured-artist", label: "Featured Artist" },
  { id: "featured-playlist", label: "Featured Playlist" },
];

const NOW_PLAYING_LAYOUT_OPTIONS: { id: NowPlayingLayout; label: string }[] = [
  { id: "full", label: "Full" },
  { id: "compact", label: "Compact" },
];

const TRACKS_LAYOUT_OPTIONS: { id: TracksLayout; label: string }[] = [
  { id: "list", label: "List" },
  { id: "grid", label: "Grid" },
];

const TIME_RANGE_OPTIONS: { id: TimeRangeId; label: string }[] = [
  { id: "short_term", label: "Last 4 Weeks" },
  { id: "medium_term", label: "Last 6 Months" },
  { id: "long_term", label: "All Time" },
];

function cycleId<T extends string>(options: { id: T }[], current: T, dir: 1 | -1): T {
  const ids = options.map((o) => o.id);
  const idx = ids.indexOf(current);
  return ids[(idx + dir + ids.length) % ids.length];
}

function cycleValue<T>(values: readonly T[], current: T, dir: 1 | -1): T {
  const idx = values.indexOf(current);
  return values[(idx + dir + values.length) % values.length];
}

function AttributeRow({
  label,
  value,
  onPrev,
  onNext,
}: {
  label: string;
  value: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-text-muted">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          aria-label={`Previous ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:bg-surface-hover hover:text-text"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="w-32 text-center text-sm font-medium capitalize">{value}</span>
        <button
          type="button"
          onClick={onNext}
          aria-label={`Next ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:bg-surface-hover hover:text-text"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

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

  const [type, setType] = useState<CardType>("now-playing");
  const [theme, setTheme] = useState("default");
  const [nowPlayingLayout, setNowPlayingLayout] = useState<NowPlayingLayout>("full");
  const [tracksLayout, setTracksLayout] = useState<TracksLayout>("list");
  const [timeRange, setTimeRange] = useState<TimeRangeId>("short_term");
  const [limit, setLimit] = useState(5);
  const [featuredSelection, setFeaturedSelection] = useState<PickerItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const featuredPickerType = FEATURED_PICKER_TYPE[type] ?? null;
  const showTimeRange = !featuredPickerType && type !== "now-playing" && type !== "recently-played";
  const showCount = type === "top-tracks" || type === "top-artists" || type === "recently-played";

  function selectType(next: CardType) {
    setType(next);
    setFeaturedSelection(null);
  }

  function buildConfig(): Record<string, unknown> {
    if (type === "now-playing") return { layout: nowPlayingLayout };
    if (type === "top-tracks") return { time_range: timeRange, limit, layout: tracksLayout };
    if (type === "top-artists") return { time_range: timeRange, limit };
    if (type === "recently-played") return { limit };
    if (featuredPickerType) return { spotifyId: featuredSelection?.id ?? "" };
    return { time_range: timeRange };
  }

  // Live preview: debounced fetch of the SVG for the current (unsaved) form state,
  // rendered via a blob URL so we can attach the auth token without exposing it in an
  // <img src> URL.
  useEffect(() => {
    if (!connection || !token) return;
    if (featuredPickerType && !featuredSelection) {
      setPreviewUrl(null);
      setPreviewError(null);
      return;
    }

    const config = buildConfig();
    const timeout = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const response = await authFetch(token, "/api/cards/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: "spotify", type, theme, config }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setPreviewError(data.error ?? "Failed to load preview.");
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = url;
        setPreviewUrl(url);
      } catch {
        setPreviewError("Failed to load preview.");
      } finally {
        setPreviewLoading(false);
      }
    }, 450);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, token, type, theme, nowPlayingLayout, tracksLayout, timeRange, limit, featuredSelection]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

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

    const response = await authFetch(token, "/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "spotify", type, theme, config: buildConfig() }),
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
        <p className="mt-1 text-text-muted">Flip through options with the arrows — the preview updates live.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="flex min-h-[220px] items-center justify-center bg-bg">
            {featuredPickerType && !featuredSelection ? (
              <p className="px-4 text-center text-sm text-text-muted">Search and pick one to preview it here.</p>
            ) : previewError ? (
              <p className="px-4 text-center text-sm text-red-400">{previewError}</p>
            ) : previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Card preview"
                className={`max-w-full transition-opacity ${previewLoading ? "opacity-50" : "opacity-100"}`}
              />
            ) : (
              <p className="text-sm text-text-muted">Loading preview…</p>
            )}
          </Card>

          <Card>
            <form onSubmit={handleSubmit}>
              <div className="divide-y divide-border">
                <AttributeRow
                  label="Card type"
                  value={TYPE_OPTIONS.find((t) => t.id === type)!.label}
                  onPrev={() => selectType(cycleId(TYPE_OPTIONS, type, -1))}
                  onNext={() => selectType(cycleId(TYPE_OPTIONS, type, 1))}
                />
                <AttributeRow
                  label="Theme"
                  value={theme}
                  onPrev={() => setTheme(cycleValue(THEME_OPTIONS, theme, -1))}
                  onNext={() => setTheme(cycleValue(THEME_OPTIONS, theme, 1))}
                />

                {type === "now-playing" && (
                  <AttributeRow
                    label="Layout"
                    value={NOW_PLAYING_LAYOUT_OPTIONS.find((l) => l.id === nowPlayingLayout)!.label}
                    onPrev={() => setNowPlayingLayout(cycleId(NOW_PLAYING_LAYOUT_OPTIONS, nowPlayingLayout, -1))}
                    onNext={() => setNowPlayingLayout(cycleId(NOW_PLAYING_LAYOUT_OPTIONS, nowPlayingLayout, 1))}
                  />
                )}

                {type === "top-tracks" && (
                  <AttributeRow
                    label="Layout"
                    value={TRACKS_LAYOUT_OPTIONS.find((l) => l.id === tracksLayout)!.label}
                    onPrev={() => setTracksLayout(cycleId(TRACKS_LAYOUT_OPTIONS, tracksLayout, -1))}
                    onNext={() => setTracksLayout(cycleId(TRACKS_LAYOUT_OPTIONS, tracksLayout, 1))}
                  />
                )}

                {featuredPickerType && (
                  <div className="py-3">
                    <span className="mb-2 block text-sm text-text-muted">
                      {featuredPickerType === "track" && "Track"}
                      {featuredPickerType === "artist" && "Artist"}
                      {featuredPickerType === "playlist" && "Playlist"}
                    </span>
                    <SpotifySearchPicker
                      type={featuredPickerType}
                      token={token}
                      selected={featuredSelection}
                      onSelect={setFeaturedSelection}
                    />
                  </div>
                )}

                {showTimeRange && (
                  <AttributeRow
                    label="Time range"
                    value={TIME_RANGE_OPTIONS.find((t) => t.id === timeRange)!.label}
                    onPrev={() => setTimeRange(cycleId(TIME_RANGE_OPTIONS, timeRange, -1))}
                    onNext={() => setTimeRange(cycleId(TIME_RANGE_OPTIONS, timeRange, 1))}
                  />
                )}

                {showCount && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-text-muted">
                      {type === "top-artists" ? "Number of artists" : "Number of tracks"}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setLimit((n) => Math.max(1, n - 1))}
                        aria-label="Fewer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:bg-surface-hover hover:text-text"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-32 text-center text-sm font-medium">{limit}</span>
                      <button
                        type="button"
                        onClick={() => setLimit((n) => Math.min(10, n + 1))}
                        aria-label="More"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:bg-surface-hover hover:text-text"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <Button
                type="submit"
                disabled={submitting || Boolean(featuredPickerType && !featuredSelection)}
                className="mt-6 w-full"
              >
                {submitting ? "Creating…" : "Create card"}
              </Button>
            </form>
          </Card>
        </div>
      </Layout>
    </>
  );
}
