import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useConvexAuth, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { authFetch } from "../../../lib/authFetch";
import { getSiteUrl } from "../../../lib/env";
import { Layout } from "../../../components/Layout";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button, LinkButton } from "../../../components/ui/Button";
import { MAX_CARDS_PER_USER } from "../../../lib/limits";

const SITE_URL = getSiteUrl();

export default function CardsList() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const token = useAuthToken();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  const cards = useQuery(api.cards.listForCurrentUser, isLoading ? "skip" : {});

  async function handleDelete(id: string) {
    await authFetch(token, `/api/cards/${id}`, { method: "DELETE" });
    // The cards list query is reactive — Convex will push the updated list automatically.
  }

  if (isLoading || !isAuthenticated || cards === undefined) {
    return (
      <Layout>
        <p className="text-text-muted">Loading…</p>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Your cards — README Cards</title>
      </Head>
      <Layout>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Your cards</h1>
            <p className="mt-1 font-mono text-xs text-text-muted">
              {cards.length} / {MAX_CARDS_PER_USER} cards
            </p>
          </div>
          {cards.length >= MAX_CARDS_PER_USER ? (
            <span className="text-sm text-text-muted">Limit reached — delete a card to add another</span>
          ) : (
            <LinkButton href="/dashboard/cards/new">
              <Plus className="h-4 w-4" /> New card
            </LinkButton>
          )}
        </div>
        <p className="mt-2 max-w-xl text-sm text-text-muted">
          Copy the snippet under a card and paste it into <code className="text-text">README.md</code> in the repo
          named exactly like your GitHub username (create that repo if you don&apos;t have one — GitHub turns it into
          your profile page). The image updates on its own; you never need to touch the snippet again.
        </p>

        {cards.length === 0 && <p className="mt-8 text-text-muted">No cards yet.</p>}

        <div className="mt-8 space-y-5">
          {cards.map((card) => {
            const url = `${SITE_URL}/api/card/${card.publicId}`;
            const snippet = `[![${card.provider} ${card.type}](${url})](${SITE_URL})`;
            return (
              <Card key={card._id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`${card.provider} ${card.type}`} className="max-w-full rounded-lg" />

                <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
                  <span className="capitalize">{card.type.replace("-", " ")}</span>
                  <span>·</span>
                  <Badge>{card.theme}</Badge>
                </div>

                <div className="relative mt-3">
                  <pre className="overflow-x-auto rounded-lg border border-border bg-bg p-3 pr-12 font-mono text-xs">
                    <code>{snippet}</code>
                  </pre>
                  <CopyButton text={snippet} />
                </div>

                <Button variant="danger" onClick={() => handleDelete(card._id)} className="mt-4">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </Card>
            );
          })}
        </div>
      </Layout>
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy embed snippet"
      className="absolute right-2.5 top-2.5 rounded-md p-1.5 text-text-muted transition hover:bg-surface-hover hover:text-text"
    >
      {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}
