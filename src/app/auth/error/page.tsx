import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Sign-in problem", robots: { index: false } };

const REASONS: Record<string, { title: string; description: string }> = {
  expired: {
    title: "That link has expired",
    description:
      "Email links work once and only for a limited time. If you opened it in a different browser than the one you signed up with, open it in the original browser or request a new one.",
  },
  provider: {
    title: "Sign-in was cancelled",
    description: "The sign-in provider didn't complete the request. Please try again.",
  },
  config: {
    title: "Authentication isn't configured",
    description: "Supabase keys are missing on this deployment. See the README to finish setup.",
  },
  missing: {
    title: "Invalid link",
    description: "This link is incomplete. Please use the most recent email we sent you.",
  },
};

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const copy = REASONS[reason ?? ""] ?? REASONS.missing;
  return (
    <div className="container-page max-w-2xl py-16">
      <EmptyState title={copy.title} description={copy.description} action={{ label: "Back to sign in", href: "/login" }} />
    </div>
  );
}
