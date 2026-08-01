import { ConvexHttpClient } from "convex/browser";

// Stateful (holds the auth token) — always create a fresh instance per request,
// never share one across requests on the server.
export function createConvexClient(): ConvexHttpClient {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}
