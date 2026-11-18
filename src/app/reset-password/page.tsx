import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { EmptyState } from "@/components/shared/empty-state";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage() {
  // The reset email link signs the user in with a short-lived recovery session (via /auth/callback).
  const user = await getUser();
  if (!user) {
    return (
      <div className="container-page max-w-2xl py-16">
        <EmptyState
          title="This reset link has expired"
          description="Password reset links work once and expire after an hour. Request a fresh one and open it in this browser."
          action={{ label: "Request a new link", href: "/forgot-password" }}
        />
      </div>
    );
  }
  return (
    <AuthShell title="Choose a new password" subtitle={`Signed in as ${user.email ?? "your account"}.`}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
