import type { GetServerSideProps } from "next";
import Link from "next/link";
import { requireConvexSession } from "../../lib/auth/requireConvexSession";
import { api } from "../../convex/_generated/api";

interface Props {
  username: string;
  avatarUrl: string | null;
  spotifyConnected: boolean;
  spotifyDisplayName: string | null;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const result = await requireConvexSession(ctx);
  if ("redirect" in result) return result;

  const { client, user } = result;
  const connection = await client.query(api.connections.getForCurrentUser, { provider: "spotify" });

  return {
    props: {
      username: user.name ?? "there",
      avatarUrl: user.image ?? null,
      spotifyConnected: Boolean(connection),
      spotifyDisplayName: connection?.displayName ?? null,
    },
  };
};

export default function Dashboard({ username, avatarUrl, spotifyConnected, spotifyDisplayName }: Props) {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        {avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={username} width={40} height={40} style={{ borderRadius: "50%" }} />
        )}
        <h1 style={{ fontSize: 22 }}>Welcome, {username}</h1>
      </div>

      <section style={{ margin: "32px 0", padding: 20, border: "1px solid #2a2a2a", borderRadius: 12 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Spotify</h2>
        {spotifyConnected ? (
          <p style={{ color: "#1db954" }}>Connected as {spotifyDisplayName}</p>
        ) : (
          <>
            <p style={{ color: "#b3b3b3", marginBottom: 12 }}>
              Connect your Spotify account to build now-playing and top-tracks cards.
            </p>
            <a
              href="/api/connect/spotify"
              style={{
                display: "inline-block",
                padding: "10px 18px",
                background: "#1db954",
                color: "#000",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Connect Spotify
            </a>
          </>
        )}
      </section>

      <Link href="/dashboard/cards" style={{ color: "#1db954" }}>
        Manage your cards →
      </Link>
    </main>
  );
}
