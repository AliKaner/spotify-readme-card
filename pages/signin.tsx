import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";

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
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: 22, marginBottom: 24 }}>Sign in</h1>
      <button
        onClick={() => signIn("github", { redirectTo: "/signin" })}
        style={{
          padding: "12px 22px",
          background: "#1db954",
          color: "#000",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Sign in with GitHub
      </button>
    </main>
  );
}
