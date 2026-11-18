import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryChips } from "@/components/home/category-chips";
import { FreshNearYou } from "@/components/home/fresh-near-you";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { SustainabilityStrip } from "@/components/home/sustainability-strip";
import { ListingGrid, ListingGridSkeleton } from "@/components/listings/listing-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";
import { getRecentListings } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function RecentlyListed() {
  if (!isSupabaseConfigured) {
    return <EmptyState title="Connect Supabase to see listings" description="Follow the README to add your keys, run the migration and seed data." />;
  }
  const listings = await getRecentListings(8);
  if (listings.length === 0) {
    return (
      <EmptyState
        title="Nothing listed yet"
        description="Be the first to give something a second life. Listing is free and takes two minutes."
        action={{ label: "List an item", href: "/sell" }}
      />
    );
  }
  return <ListingGrid listings={listings} priorityCount={4} />;
}

async function ImpactStrip() {
  if (!isSupabaseConfigured) return <SustainabilityStrip activeListings={0} soldListings={0} />;
  const supabase = await createClient();
  const [active, sold] = await Promise.all([
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "sold"),
  ]);
  return <SustainabilityStrip activeListings={active.count ?? 0} soldListings={sold.count ?? 0} />;
}

export default function HomePage() {
  return (
    <>
      <Hero />

      <div className="container-page space-y-20 pt-10 sm:space-y-28 sm:pt-12">
        <section aria-labelledby="browse-categories">
          <FadeIn>
            <h2 id="browse-categories" className="sr-only">
              Browse by category
            </h2>
            <CategoryChips />
          </FadeIn>
        </section>

        <section aria-labelledby="fresh-near-you" className="space-y-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Close to home</p>
              <h2 id="fresh-near-you" className="mt-2 font-serif text-3xl sm:text-4xl">
                Fresh near you
              </h2>
            </div>
          </div>
          {isSupabaseConfigured ? <FreshNearYou /> : null}
        </section>

        <section aria-labelledby="recently-listed" className="space-y-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Just in</p>
              <h2 id="recently-listed" className="mt-2 font-serif text-3xl sm:text-4xl">
                Recently listed
              </h2>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/marketplace">
                View all <ArrowRight />
              </Link>
            </Button>
          </div>
          <Suspense fallback={<ListingGridSkeleton count={8} />}>
            <RecentlyListed />
          </Suspense>
        </section>

        <HowItWorks />

        <Suspense fallback={<div className="h-72 rounded-3xl bg-forest-deep" />}>
          <ImpactStrip />
        </Suspense>

        <section className="rounded-3xl bg-secondary px-6 py-16 text-center sm:px-16 sm:py-20">
          <FadeIn>
            <p className="eyebrow">Ready when you are</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-serif text-[2rem] sm:text-5xl">
              That calculator from first year deserves another semester.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/sell">List an item — free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/marketplace?view=map">Explore the map</Link>
              </Button>
            </div>
          </FadeIn>
        </section>
      </div>
    </>
  );
}
