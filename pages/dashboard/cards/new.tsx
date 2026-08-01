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

const THEME_OPTIONS = Object.keys(themes);

const TYPE_OPTIONS: { id: "now-playing" | "top-tracks"; label: string }[] = [
  { id: "now-playing", label: "Now Playing" },
  { id: "top-tracks", label: "Top Tracks" },
];

const TIME_RANGE_OPTIONS: { id: "short_term" | "medium_term" | "long_term"; label: string }[] = [
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

  const [type, setType] = useState<"now-playing" | "top-tracks">("now-playing");
  const [theme, setTheme] = useState("default");
  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("short_term");
  const [limit, setLimit] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Live preview: debounced fetch of the SVG for the current (unsaved) form state,
  // rendered via a blob URL so we can attach the auth token without exposing it in an
  // <img src> URL.
  useEffect(() => {
    if (!connection || !token) return;

    const config = type === "top-tracks" ? { time_range: timeRange, limit } : {};
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
  }, [connection, token, type, theme, timeRange, limit]);

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
        <p className="mt-1 text-text-muted">Flip through options with the arrows — the preview updates live.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="flex min-h-[220px] items-center justify-center bg-bg">
            {previewError ? (
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
                  onPrev={() => setType(cycleId(TYPE_OPTIONS, type, -1))}
                  onNext={() => setType(cycleId(TYPE_OPTIONS, type, 1))}
                />
                <AttributeRow
                  label="Theme"
                  value={theme}
                  onPrev={() => setTheme(cycleValue(THEME_OPTIONS, theme, -1))}
                  onNext={() => setTheme(cycleValue(THEME_OPTIONS, theme, 1))}
                />

                {type === "top-tracks" && (
                  <>
                    <AttributeRow
                      label="Time range"
                      value={TIME_RANGE_OPTIONS.find((t) => t.id === timeRange)!.label}
                      onPrev={() => setTimeRange(cycleId(TIME_RANGE_OPTIONS, timeRange, -1))}
                      onNext={() => setTimeRange(cycleId(TIME_RANGE_OPTIONS, timeRange, 1))}
                    />
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-text-muted">Number of tracks</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setLimit((n) => Math.max(1, n - 1))}
                          aria-label="Fewer tracks"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:bg-surface-hover hover:text-text"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-32 text-center text-sm font-medium">{limit}</span>
                        <button
                          type="button"
                          onClick={() => setLimit((n) => Math.min(10, n + 1))}
                          aria-label="More tracks"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:bg-surface-hover hover:text-text"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <Button type="submit" disabled={submitting} className="mt-6 w-full">
                {submitting ? "Creating…" : "Create card"}
              </Button>
            </form>
          </Card>
        </div>
      </Layout>
    </>
  );
}
