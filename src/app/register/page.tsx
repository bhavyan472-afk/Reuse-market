import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { safeRedirectPath } from "@/lib/sanitize";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell title="Join ReUse Market" subtitle="Free forever. List your first item in under two minutes.">
      <RegisterForm next={safeRedirectPath(next, "/")} />
    </AuthShell>
  );
}
