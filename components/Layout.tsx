import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { api } from "../convex/_generated/api";

export function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const user = useQuery(api.users.me, isLoading || !isAuthenticated ? "skip" : {});

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-bg/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            {!isLoading && isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-text-muted transition hover:text-text">
                  Dashboard
                </Link>
                <Link href="/dashboard/cards" className="text-text-muted transition hover:text-text">
                  Cards
                </Link>
                <Link href="/dashboard/badges" className="text-text-muted transition hover:text-text">
                  Badges
                </Link>
                {user?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name ?? ""} className="h-7 w-7 rounded-full" />
                )}
                <button
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  className="flex items-center text-text-muted transition hover:text-text"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                className="rounded-lg bg-accent px-4 py-2 font-medium text-black transition hover:bg-accent-hover"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>

      <footer className="border-t border-border py-8 text-center text-sm text-text-muted">
        <p>
          Self-hosted and open source on{" "}
          <a
            href="https://github.com/AliKaner/spotify-readme-card"
            className="underline decoration-border underline-offset-4 transition hover:text-text"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
