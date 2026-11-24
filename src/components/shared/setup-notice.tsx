import { TriangleAlert } from "lucide-react";

export function SetupNotice() {
  return (
    <div role="alert" className="border-b border-saffron/40 bg-saffron-tint">
      <div className="container-page flex items-start gap-3 py-3 text-sm">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-gold-text" aria-hidden />
        <p>
          <strong className="font-medium">Setup needed:</strong> Supabase isn&apos;t configured, so listings and accounts are
          unavailable. Copy <code className="rounded bg-card px-1">.env.example</code> to{" "}
          <code className="rounded bg-card px-1">.env.local</code>, add your project URL and anon key, then restart the dev
          server. See the README for the full walkthrough.
        </p>
      </div>
    </div>
  );
}
