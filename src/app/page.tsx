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
import { Accent, SectionHeading } from "@/components/shared/section-heading";
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

      <div className="container-page space-y-24 pt-20 pb-4 sm:space-y-32 sm:pt-28 sm:pb-6">
        <section aria-labelledby="browse-categories" className="space-y-10">
          <SectionHeading
            id="browse-categories"
            eyebrow="Browse the collection"
            title={<>Shop by <Accent>category</Accent></>}
            action={{ label: "Enter the marketplace", href: "/marketplace" }}
          />
          <CategoryChips />
        </section>

        <section aria-labelledby="fresh-near-you" className="space-y-10">
          <SectionHeading id="fresh-near-you" eyebrow="Close to home" title={<>Fresh <Accent>near you</Accent></>} />
          {isSupabaseConfigured ? <FreshNearYou /> : null}
        </section>

        <section aria-labelledby="recently-listed" className="space-y-10">
          <SectionHeading
            id="recently-listed"
            eyebrow="Just in"
            title={<>Recently <Accent>listed</Accent></>}
            action={{ label: "View all", href: "/marketplace" }}
          />
          <Suspense fallback={<ListingGridSkeleton count={8} />}>
            <RecentlyListed />
          </Suspense>
        </section>

        <HowItWorks />

        <Suspense fallback={<div className="h-80 rounded-[4px] bg-forest-deep" />}>
          <ImpactStrip />
        </Suspense>

        <section aria-labelledby="cta" className="relative border-y border-border py-20 text-center sm:py-28">
          <FadeIn>
            <p className="eyebrow">Ready when you are</p>
            <h2 id="cta" className="display mx-auto mt-6 max-w-3xl text-[2.6rem] text-forest sm:text-[4.2rem]">
              That calculator from first year deserves <Accent>another semester.</Accent>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-muted-foreground">
              Listing is free and takes about two minutes. Buyers message you directly — no commission, ever.
            </p>
          </FadeIn>
          <FadeIn delay={0.12} className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="uppercase">
              <Link href="/sell">List an item — free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="uppercase">
              <Link href="/marketplace?view=map">Explore the map</Link>
            </Button>
          </FadeIn>
        </section>
      </div>
    </>
  );
}
