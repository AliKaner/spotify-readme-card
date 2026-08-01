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
        <div className="flex justify-center py-6">
          <Card className="w-full max-w-sm text-center">
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
      </Layout>
    </>
  );
}
