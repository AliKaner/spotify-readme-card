import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { LogIn } from "lucide-react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LogoMark } from "../components/Logo";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <>
      <Head>
        <title>Sign in — README Cards</title>
      </Head>
      <Layout>
        <section className="relative -mx-6 overflow-hidden rounded-3xl px-6 py-16">
          <div className="pointer-events-none absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)]" />
          <div className="pointer-events-none absolute inset-0 bg-hero-glow" />

          <div className="relative mx-auto flex max-w-sm flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/api/demo-card?type=now-playing&theme=dracula"
              alt=""
              className="shadow-elevated mb-8 w-full max-w-xs -rotate-2 rounded-2xl"
            />
            <Card className="shadow-elevated w-full">
              <LogoMark className="mx-auto mb-6 h-12 w-12" />
              <h1 className="text-xl font-semibold">Sign in</h1>
              <p className="mt-2 text-sm text-text-muted">
                Use your GitHub account to connect services and build cards.
              </p>
              <Button onClick={() => signIn("github", { redirectTo: "/signin" })} className="mt-6 w-full">
                <LogIn className="h-4 w-4" />
                Sign in with GitHub
              </Button>
            </Card>
          </div>
        </section>
      </Layout>
    </>
  );
}
