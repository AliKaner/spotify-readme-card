import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useConvexAuth, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authFetch } from "../../lib/authFetch";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  const user = useQuery(api.users.me, isLoading ? "skip" : {});
  const connection = useQuery(api.connections.getForCurrentUser, isLoading ? "skip" : { provider: "spotify" });

  if (isLoading || !isAuthenticated || user === undefined) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
        <p style={{ color: "#b3b3b3" }}>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        {user?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name ?? "avatar"} width={40} height={40} style={{ borderRadius: "50%" }} />
        )}
        <h1 style={{ fontSize: 22 }}>Welcome, {user?.name ?? "there"}</h1>
      </div>

      <section style={{ margin: "32px 0", padding: 20, border: "1px solid #2a2a2a", borderRadius: 12 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Spotify</h2>
        {connection === undefined ? (
          <p style={{ color: "#b3b3b3" }}>Loading…</p>
        ) : connection ? (
          <p style={{ color: "#1db954" }}>Connected as {connection.displayName}</p>
        ) : (
          <ConnectSpotifyButton />
        )}
      </section>

      <Link href="/dashboard/cards" style={{ color: "#1db954" }}>
        Manage your cards →
      </Link>
    </main>
  );
}

function ConnectSpotifyButton() {
  const token = useAuthToken();

  async function handleClick() {
    const response = await authFetch(token, "/api/connect/spotify");
    if (!response.ok) return;
    const { url } = await response.json();
    window.location.href = url;
  }

  return (
    <>
      <p style={{ color: "#b3b3b3", marginBottom: 12 }}>
        Connect your Spotify account to build now-playing and top-tracks cards.
      </p>
      <button
        onClick={handleClick}
        style={{
          padding: "10px 18px",
          background: "#1db954",
          color: "#000",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Connect Spotify
      </button>
    </>
  );
}
