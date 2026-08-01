import { useEffect, useRef, useState, type FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useConvexAuth, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, Minus, Plus, Music2, BarChart3, Layers, Trophy } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { authFetch } from "../../../lib/authFetch";
import { themes } from "../../../lib/themes";
import { Layout } from "../../../components/Layout";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { SpotifySearchPicker, type PickerItem, type PickerType } from "../../../components/SpotifySearchPicker";
import { SOCIAL_PLATFORMS } from "../../../lib/cards/socialPlatforms";

type CardType =
  | "now-playing"
  | "top-tracks"
  | "top-artists"
  | "recently-played"
  | "top-genres"
  | "sonic-profile"
  | "featured-track"
  | "featured-artist"
  | "featured-playlist"
  | "gallery"
  | "product"
  | "social"
  | "hobby-stat"
  | "github-stats"
  | "top-languages"
  | "top-repos"
  | "recent-activity"
  | "badges";

type ProviderId = "spotify" | "custom" | "github" | "achievements";
type TimeRangeId = "short_term" | "medium_term" | "long_term";

const FEATURED_PICKER_TYPE: Partial<Record<CardType, PickerType>> = {
  "featured-track": "track",
  "featured-artist": "artist",
  "featured-playlist": "playlist",
};

const THEME_OPTIONS = Object.keys(themes);

const PROVIDER_TABS: { id: ProviderId; label: string; icon: typeof Music2 }[] = [
  { id: "spotify", label: "Spotify", icon: Music2 },
  { id: "github", label: "GitHub", icon: BarChart3 },
  { id: "custom", label: "Personal", icon: Layers },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

const TYPE_OPTIONS: { id: CardType; label: string; provider: ProviderId }[] = [
  { id: "now-playing", label: "Now Playing", provider: "spotify" },
  { id: "top-tracks", label: "Top Tracks", provider: "spotify" },
  { id: "top-artists", label: "Top Artists", provider: "spotify" },
  { id: "recently-played", label: "Recently Played", provider: "spotify" },
  { id: "top-genres", label: "Top Genres", provider: "spotify" },
  { id: "sonic-profile", label: "Sonic Profile", provider: "spotify" },
  { id: "featured-track", label: "Featured Track", provider: "spotify" },
  { id: "featured-artist", label: "Featured Artist", provider: "spotify" },
  { id: "featured-playlist", label: "Featured Playlist", provider: "spotify" },
  { id: "gallery", label: "Gallery", provider: "custom" },
  { id: "product", label: "Product", provider: "custom" },
  { id: "social", label: "Social", provider: "custom" },
  { id: "hobby-stat", label: "Hobby Stat", provider: "custom" },
  { id: "github-stats", label: "GitHub Stats", provider: "github" },
  { id: "top-languages", label: "Top Languages", provider: "github" },
  { id: "top-repos", label: "Top Repositories", provider: "github" },
  { id: "recent-activity", label: "Recent Activity", provider: "github" },
  { id: "badges", label: "Badges", provider: "achievements" },
];

const SINGLE_ITEM_TYPES: CardType[] = [
  "now-playing",
  "featured-track",
  "featured-artist",
  "featured-playlist",
  "product",
  "social",
  "hobby-stat",
];
const RANKED_LIST_TYPES: CardType[] = ["top-tracks", "top-artists", "recently-played", "top-repos", "recent-activity"];

const SINGLE_ITEM_LAYOUT_OPTIONS = [
  { id: "full", label: "Full" },
  { id: "compact", label: "Compact" },
  { id: "terminal", label: "Terminal" },
  { id: "badge", label: "Badge" },
  { id: "portrait", label: "Portrait" },
  { id: "split", label: "Split" },
];

const RANKED_LIST_LAYOUT_OPTIONS = [
  { id: "list", label: "List" },
  { id: "grid", label: "Grid" },
  { id: "avatars", label: "Avatars" },
  { id: "terminal", label: "Terminal" },
  { id: "bars", label: "Bars" },
  { id: "compact", label: "Compact" },
];

const AGGREGATE_STAT_LAYOUT_OPTIONS = [
  { id: "bars", label: "Bars" },
  { id: "terminal", label: "Terminal" },
  { id: "radial", label: "Radial" },
  { id: "badge", label: "Badge" },
  { id: "tiles", label: "Tiles" },
  { id: "portrait", label: "Portrait" },
];

const GALLERY_LAYOUT_OPTIONS = [
  { id: "stack", label: "Stack" },
  { id: "grid", label: "Grid" },
  { id: "avatars", label: "Avatars" },
  { id: "terminal", label: "Terminal" },
  { id: "bars", label: "Bars" },
  { id: "compact", label: "Compact" },
];

const GITHUB_STATS_LAYOUT_OPTIONS = [
  { id: "full", label: "Full" },
  { id: "terminal", label: "Terminal" },
  { id: "radial", label: "Radial" },
  { id: "badge", label: "Badge" },
  { id: "tiles", label: "Tiles" },
  { id: "portrait", label: "Portrait" },
];

function layoutOptionsFor(t: CardType): { id: string; label: string }[] {
  if (t === "gallery") return GALLERY_LAYOUT_OPTIONS;
  if (t === "github-stats") return GITHUB_STATS_LAYOUT_OPTIONS;
  if (SINGLE_ITEM_TYPES.includes(t)) return SINGLE_ITEM_LAYOUT_OPTIONS;
  if (RANKED_LIST_TYPES.includes(t)) return RANKED_LIST_LAYOUT_OPTIONS;
  return AGGREGATE_STAT_LAYOUT_OPTIONS;
}

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

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none";
const fieldLabelClass = "block text-sm font-medium text-text-muted";

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
  const [layout, setLayout] = useState(SINGLE_ITEM_LAYOUT_OPTIONS[0].id);
  const [timeRange, setTimeRange] = useState<TimeRangeId>("short_term");
  const [limit, setLimit] = useState(5);
  const [featuredSelection, setFeaturedSelection] = useState<PickerItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom (no-OAuth) card fields
  const [galleryTitle, setGalleryTitle] = useState("Gallery");
  const [galleryImages, setGalleryImages] = useState([
    { url: "", caption: "" },
    { url: "", caption: "" },
    { url: "", caption: "" },
    { url: "", caption: "" },
  ]);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("twitter");
  const [socialOtherPlatform, setSocialOtherPlatform] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [socialFollowers, setSocialFollowers] = useState("");
  const [hobbyLabel, setHobbyLabel] = useState("");
  const [hobbyValue, setHobbyValue] = useState("");
  const [hobbyDescription, setHobbyDescription] = useState("");
  const [hobbyImageUrl, setHobbyImageUrl] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const currentOption = TYPE_OPTIONS.find((t) => t.id === type)!;
  const featuredPickerType = FEATURED_PICKER_TYPE[type] ?? null;
  const showTimeRange = !featuredPickerType && (type === "top-tracks" || type === "top-artists" || type === "top-genres" || type === "sonic-profile");
  const showCount = type === "top-tracks" || type === "top-artists" || type === "recently-played";
  const spotifyNotConnected = currentOption.provider === "spotify" && !connection;

  function updateGalleryImage(index: number, field: "url" | "caption", value: string) {
    setGalleryImages((prev) => prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)));
  }

  function selectType(next: CardType) {
    setType(next);
    setFeaturedSelection(null);
    setLayout(layoutOptionsFor(next)[0].id);
  }

  function typesForProvider(providerId: ProviderId): typeof TYPE_OPTIONS {
    return TYPE_OPTIONS.filter((t) => t.provider === providerId);
  }

  function selectProvider(providerId: ProviderId) {
    if (providerId === currentOption.provider) return;
    selectType(typesForProvider(providerId)[0].id);
  }

  function isCustomFormReady(): boolean {
    if (type === "product") return productName.trim().length > 0;
    if (type === "social") {
      const platformReady = socialPlatform !== "other" || socialOtherPlatform.trim().length > 0;
      return platformReady && socialHandle.trim().length > 0;
    }
    if (type === "hobby-stat") return hobbyLabel.trim().length > 0 && hobbyValue.trim().length > 0;
    if (type === "gallery") return galleryImages.some((img) => img.url.trim().length > 0);
    return true;
  }

  function buildConfig(): Record<string, unknown> {
    if (featuredPickerType) return { spotifyId: featuredSelection?.id ?? "", layout };
    if (type === "now-playing") return { layout };
    if (type === "top-tracks") return { time_range: timeRange, limit, layout };
    if (type === "top-artists") return { time_range: timeRange, limit, layout };
    if (type === "recently-played") return { limit, layout };
    if (type === "top-genres" || type === "sonic-profile") return { time_range: timeRange, layout };
    if (type === "gallery") {
      const images = galleryImages
        .filter((img) => img.url.trim())
        .map((img) => ({ url: img.url.trim(), caption: img.caption.trim() || undefined }));
      return { title: galleryTitle.trim() || "Gallery", images, layout };
    }
    if (type === "product") {
      return {
        name: productName.trim(),
        price: productPrice.trim() || undefined,
        imageUrl: productImageUrl.trim() || undefined,
        description: productDescription.trim() || undefined,
        layout,
      };
    }
    if (type === "social") {
      return {
        platform: socialPlatform === "other" ? socialOtherPlatform.trim() : socialPlatform,
        handle: socialHandle.trim(),
        followers: socialFollowers.trim() ? Number(socialFollowers) : undefined,
        layout,
      };
    }
    if (type === "hobby-stat") {
      return {
        label: hobbyLabel.trim(),
        value: hobbyValue.trim(),
        description: hobbyDescription.trim() || undefined,
        imageUrl: hobbyImageUrl.trim() || undefined,
        layout,
      };
    }
    return { layout };
  }

  // Live preview: debounced fetch of the SVG for the current (unsaved) form state,
  // rendered via a blob URL so we can attach the auth token without exposing it in an
  // <img src> URL.
  useEffect(() => {
    if (!token) return;
    if (spotifyNotConnected) {
      setPreviewUrl(null);
      setPreviewError(null);
      return;
    }
    if (featuredPickerType && !featuredSelection) {
      setPreviewUrl(null);
      setPreviewError(null);
      return;
    }
    if (currentOption.provider === "custom" && !isCustomFormReady()) {
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
          body: JSON.stringify({ provider: currentOption.provider, type, theme, config }),
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
  }, [
    token,
    type,
    theme,
    layout,
    timeRange,
    limit,
    featuredSelection,
    spotifyNotConnected,
    galleryTitle,
    galleryImages,
    productName,
    productPrice,
    productImageUrl,
    productDescription,
    socialPlatform,
    socialOtherPlatform,
    socialHandle,
    socialFollowers,
    hobbyLabel,
    hobbyValue,
    hobbyDescription,
    hobbyImageUrl,
  ]);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await authFetch(token, "/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: currentOption.provider, type, theme, config: buildConfig() }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Failed to create card.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard/cards");
  }

  const submitDisabled =
    submitting ||
    Boolean(featuredPickerType && !featuredSelection) ||
    spotifyNotConnected ||
    (currentOption.provider === "custom" && !isCustomFormReady());

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
            {spotifyNotConnected ? (
              <p className="px-4 text-center text-sm text-text-muted">
                Connect Spotify from the{" "}
                <a href="/dashboard" className="text-accent underline underline-offset-4">
                  dashboard
                </a>{" "}
                to preview this card type.
              </p>
            ) : featuredPickerType && !featuredSelection ? (
              <p className="px-4 text-center text-sm text-text-muted">Search and pick one to preview it here.</p>
            ) : currentOption.provider === "custom" && !isCustomFormReady() ? (
              <p className="px-4 text-center text-sm text-text-muted">Fill in the details to preview your card here.</p>
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
              <div className="flex gap-2 pb-4">
                {PROVIDER_TABS.map((tab) => {
                  const active = tab.id === currentOption.provider;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => selectProvider(tab.id)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                        active
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-border text-text-muted hover:bg-surface-hover hover:text-text"
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="divide-y divide-border">
                <AttributeRow
                  label="Card type"
                  value={TYPE_OPTIONS.find((t) => t.id === type)!.label}
                  onPrev={() => selectType(cycleId(typesForProvider(currentOption.provider), type, -1))}
                  onNext={() => selectType(cycleId(typesForProvider(currentOption.provider), type, 1))}
                />
                <AttributeRow
                  label="Theme"
                  value={theme}
                  onPrev={() => setTheme(cycleValue(THEME_OPTIONS, theme, -1))}
                  onNext={() => setTheme(cycleValue(THEME_OPTIONS, theme, 1))}
                />

                {type !== "badges" && (
                  <AttributeRow
                    label="Layout"
                    value={layoutOptionsFor(type).find((l) => l.id === layout)?.label ?? layout}
                    onPrev={() => setLayout(cycleId(layoutOptionsFor(type), layout, -1))}
                    onNext={() => setLayout(cycleId(layoutOptionsFor(type), layout, 1))}
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

                {spotifyNotConnected && (
                  <p className="py-3 text-sm text-text-muted">
                    Connect Spotify from the{" "}
                    <a href="/dashboard" className="text-accent underline underline-offset-4">
                      dashboard
                    </a>{" "}
                    to use this card type.
                  </p>
                )}

                {type === "gallery" && (
                  <div className="space-y-4 py-3">
                    <label className={fieldLabelClass}>
                      Title
                      <input
                        type="text"
                        value={galleryTitle}
                        onChange={(e) => setGalleryTitle(e.target.value)}
                        placeholder="Gallery"
                        className={inputClass}
                      />
                    </label>
                    {galleryImages.map((img, i) => (
                      <div key={i} className="grid grid-cols-2 gap-3">
                        <label className={fieldLabelClass}>
                          Image {i + 1} URL
                          <input
                            type="url"
                            value={img.url}
                            onChange={(e) => updateGalleryImage(i, "url", e.target.value)}
                            placeholder="https://…"
                            className={inputClass}
                          />
                        </label>
                        <label className={fieldLabelClass}>
                          Caption
                          <input
                            type="text"
                            value={img.caption}
                            onChange={(e) => updateGalleryImage(i, "caption", e.target.value)}
                            className={inputClass}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {type === "product" && (
                  <div className="space-y-4 py-3">
                    <label className={fieldLabelClass}>
                      Name
                      <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className={inputClass} />
                    </label>
                    <label className={fieldLabelClass}>
                      Price
                      <input
                        type="text"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="$29"
                        className={inputClass}
                      />
                    </label>
                    <label className={fieldLabelClass}>
                      Image URL
                      <input
                        type="url"
                        value={productImageUrl}
                        onChange={(e) => setProductImageUrl(e.target.value)}
                        placeholder="https://…"
                        className={inputClass}
                      />
                    </label>
                    <label className={fieldLabelClass}>
                      Description
                      <input
                        type="text"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className={inputClass}
                      />
                    </label>
                  </div>
                )}

                {type === "social" && (
                  <div className="space-y-4 py-3">
                    <label className={fieldLabelClass}>
                      Platform
                      <select
                        value={socialPlatform}
                        onChange={(e) => setSocialPlatform(e.target.value)}
                        className={inputClass}
                      >
                        {SOCIAL_PLATFORMS.filter((p) => p.id !== "website").map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                        <option value="other">Other</option>
                      </select>
                    </label>
                    {socialPlatform === "other" && (
                      <label className={fieldLabelClass}>
                        Platform name
                        <input
                          type="text"
                          value={socialOtherPlatform}
                          onChange={(e) => setSocialOtherPlatform(e.target.value)}
                          placeholder="Mastodon, Bluesky, …"
                          className={inputClass}
                        />
                      </label>
                    )}
                    <label className={fieldLabelClass}>
                      Handle
                      <input
                        type="text"
                        value={socialHandle}
                        onChange={(e) => setSocialHandle(e.target.value)}
                        placeholder="yourname"
                        className={inputClass}
                      />
                    </label>
                    <label className={fieldLabelClass}>
                      Followers
                      <input
                        type="number"
                        min={0}
                        value={socialFollowers}
                        onChange={(e) => setSocialFollowers(e.target.value)}
                        className={inputClass}
                      />
                    </label>
                  </div>
                )}

                {type === "hobby-stat" && (
                  <div className="space-y-4 py-3">
                    <label className={fieldLabelClass}>
                      Label
                      <input
                        type="text"
                        value={hobbyLabel}
                        onChange={(e) => setHobbyLabel(e.target.value)}
                        placeholder="Books read in 2026"
                        className={inputClass}
                      />
                    </label>
                    <label className={fieldLabelClass}>
                      Value
                      <input
                        type="text"
                        value={hobbyValue}
                        onChange={(e) => setHobbyValue(e.target.value)}
                        placeholder="24"
                        className={inputClass}
                      />
                    </label>
                    <label className={fieldLabelClass}>
                      Description
                      <input
                        type="text"
                        value={hobbyDescription}
                        onChange={(e) => setHobbyDescription(e.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <label className={fieldLabelClass}>
                      Image URL (optional)
                      <input
                        type="url"
                        value={hobbyImageUrl}
                        onChange={(e) => setHobbyImageUrl(e.target.value)}
                        placeholder="https://…"
                        className={inputClass}
                      />
                    </label>
                  </div>
                )}
              </div>

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <Button type="submit" disabled={submitDisabled} className="mt-6 w-full">
                {submitting ? "Creating…" : "Create card"}
              </Button>
            </form>
          </Card>
        </div>
      </Layout>
    </>
  );
}
