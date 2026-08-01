import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useConvexAuth, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authFetch } from "../../../lib/authFetch";
import { getSiteUrl } from "../../../lib/env";

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
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
        <p style={{ color: "#b3b3b3" }}>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22 }}>Your cards</h1>
        <Link
          href="/dashboard/cards/new"
          style={{
            padding: "8px 14px",
            background: "#1db954",
            color: "#000",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          New card
        </Link>
      </div>

      {cards.length === 0 && <p style={{ color: "#b3b3b3" }}>No cards yet.</p>}

      {cards.map((card) => {
        const url = `${SITE_URL}/api/card/${card.publicId}`;
        const snippet = `[![${card.provider} ${card.type}](${url})](${SITE_URL})`;
        return (
          <section key={card._id} style={{ margin: "24px 0", padding: 16, border: "1px solid #2a2a2a", borderRadius: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`${card.provider} ${card.type}`} style={{ maxWidth: "100%", marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: "#b3b3b3", marginBottom: 8 }}>
              {card.type} · {card.theme}
            </p>
            <pre style={{ background: "#111", padding: 12, borderRadius: 8, overflowX: "auto", fontSize: 12 }}>
              <code>{snippet}</code>
            </pre>
            <button
              onClick={() => handleDelete(card._id)}
              style={{
                marginTop: 8,
                padding: "6px 12px",
                background: "transparent",
                color: "#e5484d",
                border: "1px solid #e5484d",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </section>
        );
      })}
    </main>
  );
}
