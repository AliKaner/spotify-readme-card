import Head from "next/head";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-deployment.vercel.app";
const TITLE = "Spotify README Card — Live Now Playing Widget for GitHub Profiles";
const DESCRIPTION =
  "Free, open-source, self-hosted SVG widget that shows your current or last played Spotify track and top tracks directly in your GitHub profile README. Deploy your own in minutes on Vercel.";

export default function Home() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="keywords"
          content="spotify github readme, spotify now playing widget, github profile spotify, spotify svg card, readme stats, github profile readme generator"
        />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/api/spotify`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/api/spotify`} />
      </Head>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>🎧 Spotify README Card</h1>
        <p style={{ color: "#b3b3b3", lineHeight: 1.6 }}>
          A live, embeddable SVG widget that shows what you&apos;re currently (or last) playing on
          Spotify, plus your top tracks — built to drop straight into a GitHub profile README.
        </p>

        <section style={{ margin: "32px 0" }}>
          <h2 style={{ fontSize: 18 }}>Now Playing</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/spotify" alt="Spotify now playing" width={480} height={140} />
        </section>

        <section style={{ margin: "32px 0" }}>
          <h2 style={{ fontSize: 18 }}>Top Tracks</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/top-tracks" alt="Spotify top tracks" width={330} />
        </section>

        <section style={{ margin: "32px 0" }}>
          <h2 style={{ fontSize: 18 }}>Use it in your README</h2>
          <pre>
            <code>{`[![Spotify](${SITE_URL}/api/spotify)](${SITE_URL})`}</code>
          </pre>
        </section>

        <p style={{ color: "#666" }}>
          Fork it, deploy your own copy, and add your own Spotify credentials — see the{" "}
          <code>README.md</code> in the repository for setup instructions.
        </p>
      </main>
    </>
  );
}
