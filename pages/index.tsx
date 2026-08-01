import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useConvexAuth } from "@convex-dev/auth/react";
import { LogIn, ArrowRight, Music2, Clock3, Radio, BarChart3, Palette, ClipboardCopy, Trophy, Layers } from "lucide-react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { LinkButton } from "../components/ui/Button";
import { listProviders, type MarketplaceEntry } from "../lib/providers/registry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-deployment.vercel.app";
const TITLE = "README Card Marketplace — Live Widgets for Your GitHub Profile";
const DESCRIPTION =
  "Spotify listening, GitHub stats, earned achievements, or your own custom cards — build a live SVG card from ready-made themes and layouts, and drop it straight into your GitHub profile README. Self-hosted, no third party in the middle of your data.";

interface Props {
  providers: MarketplaceEntry[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return { props: { providers: listProviders() } };
};

const PROVIDER_ICONS: Record<string, typeof Music2> = {
  spotify: Music2,
  github: BarChart3,
  achievements: Trophy,
  custom: Layers,
  wakatime: Clock3,
  lastfm: Radio,
};

const HOW_IT_WORKS = [
  {
    icon: LogIn,
    title: "Sign in with GitHub",
    body: "Then connect Spotify (or add data manually) — no data is shared with anyone else.",
  },
  {
    icon: Palette,
    title: "Build a card",
    body: "Pick a card type, a layout, and a theme. A live preview updates as you go.",
  },
  {
    icon: ClipboardCopy,
    title: "Paste it into your profile README",
    body: "Copy the one-line snippet into the special repo named exactly like your username (create it if you don't have one yet — GitHub turns it into your profile page).",
  },
];

const SHOWCASE = [
  { type: "now-playing", layout: "full", theme: "default", label: "Now Playing · Full" },
  { type: "now-playing", layout: "terminal", theme: "midnight", label: "Now Playing · Terminal" },
  { type: "top-tracks", layout: "grid", theme: "dracula", label: "Top Tracks · Grid" },
  { type: "top-tracks", layout: "bars", theme: "ocean", label: "Top Tracks · Bars" },
  { type: "top-artists", layout: "avatars", theme: "ocean", label: "Top Artists · Avatars" },
  { type: "top-genres", layout: "radial", theme: "dracula", label: "Top Genres · Radial" },
  { type: "sonic-profile", layout: "tiles", theme: "default", label: "Sonic Profile · Tiles" },
  { type: "featured-track", layout: "split", theme: "midnight", label: "Featured Track · Split" },
  { type: "now-playing", layout: "badge", theme: "ocean", label: "Now Playing · Badge" },
];

const FUN_SHOWCASE = [
  { type: "github-stats", layout: "trading-card", theme: "dracula", label: "GitHub Stats · Trading Card" },
  { type: "github-stats", layout: "rpg-sheet", theme: "default", label: "GitHub Stats · RPG Sheet" },
  { type: "github-stats", layout: "report-card", theme: "ocean", label: "GitHub Stats · Report Card" },
  { type: "repo-contributions", layout: "wanted-poster", theme: "default", label: "Repo Contributions · Wanted Poster" },
  { type: "repo-contributions", layout: "passport", theme: "midnight", label: "Repo Contributions · Passport" },
  { type: "top-genres", layout: "boarding-pass", theme: "default", label: "Top Genres · Boarding Pass" },
];

export default function Home({ providers }: Props) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const showDashboardLink = !isLoading && isAuthenticated;

  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="keywords"
          content="github readme widget, spotify github readme, github profile card marketplace, readme stats, self-hosted github widgets"
        />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
      </Head>

      <Layout>
        {/* Hero */}
        <section className="relative -mx-6 overflow-hidden rounded-3xl px-6 py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_20%,black,transparent)]" />
          <div className="pointer-events-none absolute inset-0 bg-hero-glow" />

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="font-mono text-xs font-medium tracking-wider text-accent">
                MARKETPLACE · 18 CARD TYPES
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Live cards for your GitHub profile, from what you actually do
              </h1>
              <p className="mt-5 max-w-md text-balance text-text-muted">
                Spotify listening, GitHub stats, earned achievements, or your own gallery and
                social links — pick a card, a layout, and a theme, then paste one line into your
                README. Every image is generated fresh on every view.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <LinkButton
                  href={showDashboardLink ? "/dashboard" : "/signin"}
                  className="shadow-accent-glow px-6 py-3 text-base"
                >
                  {showDashboardLink ? (
                    <>
                      Go to dashboard <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" /> Sign in with GitHub
                    </>
                  )}
                </LinkButton>
                <span className="text-sm text-text-muted">Free · Self-hosted · Open source</span>
              </div>
            </div>

            <div className="relative hidden h-72 lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/api/demo-card?type=top-artists&theme=ocean"
                alt="Top artists card preview"
                className="shadow-elevated absolute left-0 top-6 w-[290px] -rotate-6 rounded-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/api/demo-card?type=now-playing&theme=dracula"
                alt="Now playing card preview"
                className="shadow-elevated absolute right-0 top-24 w-[380px] rotate-2 rounded-2xl"
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-20">
          <h2 className="text-lg font-semibold">How it works</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <Card key={step.title} className="relative">
                <span className="font-mono text-xs text-text-muted">0{i + 1}</span>
                <div className="mt-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
                  <step.icon className="h-4.5 w-4.5 text-accent" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{step.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Showcase */}
        <section className="mt-20">
          <h2 className="text-lg font-semibold">Every card is live, not a mockup</h2>
          <p className="mt-1 text-sm text-text-muted">
            These are real renders from the same code your embed uses — just fed demo data.
          </p>

          <div className="mt-6 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SHOWCASE.map((item) => (
              <Card
                key={`${item.type}-${item.layout}`}
                className="shadow-elevated flex flex-col items-center justify-center gap-3 bg-bg p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/demo-card?type=${item.type}&layout=${item.layout}&theme=${item.theme}`}
                  alt={item.label}
                  className="max-w-full"
                />
                <span className="text-xs font-medium text-text-muted">{item.label}</span>
              </Card>
            ))}
          </div>
        </section>

        {/* Fun showcase */}
        <section className="mt-20">
          <h2 className="text-lg font-semibold">Some of these get a little extra</h2>
          <p className="mt-1 text-sm text-text-muted">
            Trading cards, RPG sheets, wanted posters — the same GitHub and Spotify data, rendered as something more
            fun to show off.
          </p>

          <div className="mt-6 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FUN_SHOWCASE.map((item) => (
              <Card
                key={`${item.type}-${item.layout}`}
                className="shadow-elevated flex flex-col items-center justify-center gap-3 bg-bg p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/demo-card?type=${item.type}&layout=${item.layout}&theme=${item.theme}`}
                  alt={item.label}
                  className="max-w-full"
                />
                <span className="text-xs font-medium text-text-muted">{item.label}</span>
              </Card>
            ))}
          </div>
        </section>

        {/* Integrations */}
        <section className="mt-20">
          <h2 className="mb-6 text-lg font-semibold">Integrations</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {providers.map((p) => {
              const Icon = PROVIDER_ICONS[p.id] ?? Music2;
              return (
                <Card
                  key={p.id}
                  className="flex items-center justify-between transition hover:border-accent/30 hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-hover">
                      <Icon className="h-5 w-5 text-text-muted" />
                    </div>
                    <span className="font-medium">{p.displayName}</span>
                  </div>
                  <Badge tone={p.status === "live" ? "accent" : "muted"}>
                    {p.status === "live" ? "Available" : "Coming soon"}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </section>
      </Layout>
    </>
  );
}
