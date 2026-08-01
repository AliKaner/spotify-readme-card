import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useConvexAuth } from "@convex-dev/auth/react";
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

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>🧩 README Card Marketplace</h1>
        <p style={{ color: "#b3b3b3", lineHeight: 1.6, marginBottom: 24 }}>
          Sign in with GitHub, connect the services you use, build a live SVG card from
          ready-made themes, and get a stable link to embed in your GitHub profile README.
        </p>

        <a
          href={showDashboardLink ? "/dashboard" : "/signin"}
          style={{
            display: "inline-block",
            padding: "12px 22px",
            background: "#1db954",
            color: "#000",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: 40,
          }}
        >
          {showDashboardLink ? "Go to dashboard" : "Sign in with GitHub"}
        </a>

        <section>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Integrations</h2>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
            {providers.map((p) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  border: "1px solid #2a2a2a",
                  borderRadius: 8,
                }}
              >
                <span>{p.displayName}</span>
                <span style={{ color: p.status === "live" ? "#1db954" : "#666", fontSize: 13 }}>
                  {p.status === "live" ? "Available" : "Coming soon"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <p style={{ color: "#666", marginTop: 40 }}>
          Self-hosted and open source — see <code>README.md</code> in the repository for setup
          instructions.
        </p>
      </main>
    </>
  );
}
