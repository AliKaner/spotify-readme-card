import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useConvexAuth, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Music2, CheckCircle2, ArrowRight } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { authFetch } from "../../lib/authFetch";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/ui/Card";
import { Button, LinkButton } from "../../components/ui/Button";

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
      <Layout>
        <p className="text-text-muted">Loading…</p>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard — README Cards</title>
      </Head>
      <Layout>
        <h1 className="text-2xl font-semibold">Welcome, {user?.name ?? "there"}</h1>
        <p className="mt-1 text-text-muted">Connect a service, then build a card from it.</p>

        <Card className="mt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-hover">
              <Music2 className="h-5 w-5 text-text-muted" />
            </div>
            <h2 className="font-medium">Spotify</h2>
          </div>

          <div className="mt-4">
            {connection === undefined ? (
              <p className="text-sm text-text-muted">Loading…</p>
            ) : connection ? (
              <p className="flex items-center gap-2 text-sm text-accent">
                <CheckCircle2 className="h-4 w-4" />
                Connected as {connection.displayName}
              </p>
            ) : (
              <ConnectSpotifyButton />
            )}
          </div>
        </Card>

        <LinkButton href="/dashboard/cards" variant="secondary" className="mt-8">
          Manage your cards <ArrowRight className="h-4 w-4" />
        </LinkButton>
      </Layout>
    </>
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
      <p className="mb-3 text-sm text-text-muted">
        Connect your Spotify account to build now-playing and top-tracks cards.
      </p>
      <Button onClick={handleClick}>Connect Spotify</Button>
    </>
  );
}
