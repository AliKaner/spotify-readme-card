import { useState } from "react";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { requireConvexSession } from "../../../lib/auth/requireConvexSession";
import { api } from "../../../convex/_generated/api";
import { getSiteUrl } from "../../../lib/env";

interface CardRow {
  id: string;
  publicId: string;
  provider: string;
  type: string;
  theme: string;
}

interface Props {
  cards: CardRow[];
  siteUrl: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const result = await requireConvexSession(ctx);
  if ("redirect" in result) return result;

  const cards = await result.client.query(api.cards.listForCurrentUser, {});

  return {
    props: {
      cards: cards.map((c) => ({ id: c._id, publicId: c.publicId, provider: c.provider, type: c.type, theme: c.theme })),
      siteUrl: getSiteUrl(),
    },
  };
};

export default function CardsList({ cards: initialCards, siteUrl }: Props) {
  const [cards, setCards] = useState(initialCards);

  async function handleDelete(id: string) {
    const response = await fetch(`/api/cards/${id}`, { method: "DELETE" });
    if (response.ok) {
      setCards((prev) => prev.filter((c) => c.id !== id));
    }
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
        const url = `${siteUrl}/api/card/${card.publicId}`;
        const snippet = `[![${card.provider} ${card.type}](${url})](${siteUrl})`;
        return (
          <section key={card.id} style={{ margin: "24px 0", padding: 16, border: "1px solid #2a2a2a", borderRadius: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`${card.provider} ${card.type}`} style={{ maxWidth: "100%", marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: "#b3b3b3", marginBottom: 8 }}>
              {card.type} · {card.theme}
            </p>
            <pre style={{ background: "#111", padding: 12, borderRadius: 8, overflowX: "auto", fontSize: 12 }}>
              <code>{snippet}</code>
            </pre>
            <button
              onClick={() => handleDelete(card.id)}
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
