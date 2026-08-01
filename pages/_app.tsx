import type { AppProps } from "next/app";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import "../styles/globals.css";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConvexAuthProvider client={convex}>
      <Component {...pageProps} />
    </ConvexAuthProvider>
  );
}
