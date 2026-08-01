import type { GetServerSidePropsContext } from "next";
import { getConvexSession, type ConvexSession } from "./convexSession";

type RequireSessionResult = { redirect: { destination: string; permanent: false } } | ConvexSession;

export async function requireConvexSession(ctx: GetServerSidePropsContext): Promise<RequireSessionResult> {
  const session = await getConvexSession(ctx.req.cookies);

  if (!session) {
    return {
      redirect: {
        destination: `/signin?callbackUrl=${encodeURIComponent(ctx.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  return session;
}
