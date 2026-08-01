import type { AppProps } from "next/app";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "../styles/globals.css";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${GeistSans.variable} ${GeistMono.variable} font-sans min-h-screen`}>
      <ConvexAuthProvider client={convex}>
        <Component {...pageProps} />
      </ConvexAuthProvider>
    </div>
  );
}
