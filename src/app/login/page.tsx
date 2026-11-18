import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { safeRedirectPath } from "@/lib/sanitize";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const target = safeRedirectPath(next, "/");
  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        error
          ? "That sign-in link was invalid or has expired. Please sign in again."
          : target !== "/"
            ? "Sign in to continue where you left off."
            : "Sign in to buy, sell and message other members."
      }
    >
      <LoginForm next={target} />
    </AuthShell>
  );
}
