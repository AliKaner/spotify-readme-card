import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useConvexAuth } from "@convex-dev/auth/react";
import { LogIn, ArrowRight, Music2, Clock3, Radio, BarChart3, Sparkles } from "lucide-react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { LinkButton } from "../components/ui/Button";
import { listProviders, type MarketplaceEntry } from "../lib/providers/registry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-deployment.vercel.app";
const TITLE = "README Card Marketplace — Live Widgets for Your GitHub Profile";
const DESCRIPTION =
  "Connect Spotify (and more services soon), build a live SVG card from ready-made themes, and drop it straight into your GitHub profile README. Self-hosted, no third party in the middle of your data.";

interface Props {
  providers: MarketplaceEntry[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return { props: { providers: listProviders() } };
};

const PROVIDER_ICONS: Record<string, typeof Music2> = {
  spotify: Music2,
  wakatime: Clock3,
  lastfm: Radio,
  "github-stats": BarChart3,
};

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
        <section className="bg-glow -mx-6 rounded-3xl px-6 py-20 text-center sm:py-28">
          <Badge tone="accent" className="mb-5">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Now a multi-provider marketplace
          </Badge>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Live cards for your GitHub README, built in seconds
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-text-muted">
            Connect Spotify — more services soon — pick a theme, and drop a stable,
            always-fresh SVG straight into your profile. No third party in the middle of
            your data.
          </p>
          <div className="mt-8 flex justify-center">
            <LinkButton href={showDashboardLink ? "/dashboard" : "/signin"} className="px-6 py-3 text-base">
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
          </div>
        </section>

        <section className="mt-20">
          <h2 className="mb-6 text-lg font-semibold">Integrations</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {providers.map((p) => {
              const Icon = PROVIDER_ICONS[p.id] ?? Sparkles;
              return (
                <Card key={p.id} className="flex items-center justify-between">
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
