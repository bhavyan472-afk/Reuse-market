"use client";

import { RotateCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <div className="container-page flex min-h-[70dvh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">A small hiccup.</h1>
      <p className="mt-6 max-w-md text-muted-foreground">
        {offline
          ? "You appear to be offline. Check your connection and try again."
          : "We couldn't load this page. It's usually temporary — please try again in a moment."}
      </p>
      {error.digest && <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p>}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>
          <RotateCw /> Try again
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
