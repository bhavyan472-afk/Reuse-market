import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70dvh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 font-serif text-6xl tracking-tight sm:text-8xl">
        Gone to a<br />
        <span className="text-gold-text italic">new home.</span>
      </h1>
      <p className="mt-6 max-w-md text-muted-foreground">
        This page — or the item you were looking for — doesn&apos;t exist anymore. It may have been sold or removed by the seller.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/marketplace">Browse the marketplace</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
