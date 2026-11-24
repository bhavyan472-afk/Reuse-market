import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { BudgetChips } from "@/components/home/budget-chips";
import { CategoryChips } from "@/components/home/category-chips";
import { FreshNearYou } from "@/components/home/fresh-near-you";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { SafetyTips } from "@/components/home/safety-tips";
import { SustainabilityStrip } from "@/components/home/sustainability-strip";
import { ListingGrid, ListingGridSkeleton, ListingRow, ListingRowSkeleton } from "@/components/listings/listing-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { getRecentListings, searchListings } from "@/lib/queries";
import { buildMarketQuery } from "@/lib/search-params";
import { createClient } from "@/lib/supabase/server";
import type { ListingCategory } from "@/lib/supabase/database.types";
import type { ListingCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEAL_MAX = 2000;
/** Budget-friendly band shown first on the homepage. */
const AFFORDABLE = { min: 180, max: 8000 };

/** Stable sort: affordable items (₹180–₹8,000) first, newest first within each group. */
function affordableFirst(items: ListingCardData[]) {
  const inBand = (l: ListingCardData) => l.price >= AFFORDABLE.min && l.price <= AFFORDABLE.max;
  return [...items.filter(inBand), ...items.filter((l) => !inBand(l))];
}

async function Categories() {
  let counts: Partial<Record<ListingCategory, number>> | undefined;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const results = await Promise.all(
      CATEGORIES.map((c) =>
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("status", "available")
          .eq("category", c.value),
      ),
    );
    counts = Object.fromEntries(CATEGORIES.map((c, i) => [c.value, results[i].count ?? 0]));
  }
  return <CategoryChips counts={counts} />;
}

async function Deals() {
  if (!isSupabaseConfigured) return null;
  const { items } = await searchListings({ maxPrice: DEAL_MAX, sort: "price_asc" }, { limit: 8, offset: 0 }).catch(() => ({
    items: [] as ListingCardData[],
  }));
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="deals" className="space-y-5">
      <SectionHeading
        id="deals"
        title={
          <>
            Deals under <span className="text-saffron-ink">₹2,000</span>
          </>
        }
        description="Books, calculators, accessories and more — student-budget friendly."
        action={{ label: "See all", href: `/marketplace${buildMarketQuery({ maxPrice: DEAL_MAX, sort: "price_asc" })}` }}
      />
      <ListingRow listings={items} priorityCount={2} badgeFor={(l) => (l.price <= 500 ? "Steal" : "Deal")} />
    </section>
  );
}

async function RecentlyListed() {
  if (!isSupabaseConfigured) {
    return <EmptyState title="Connect Supabase to see listings" description="Follow the README to add your keys, run the migration and seed data." />;
  }
  const listings = await getRecentListings(20);
  if (listings.length === 0) {
    return (
      <EmptyState
        title="Nothing listed yet"
        description="Be the first to give something a second life. Listing is free and takes two minutes."
        action={{ label: "List an item", href: "/sell" }}
      />
    );
  }
  // Items under ₹2,000 already appear in the Deals row above — avoid showing them twice when there is enough else.
  const fresh = listings.filter((l) => l.price > DEAL_MAX);
  return <ListingGrid listings={affordableFirst(fresh.length >= 8 ? fresh : listings).slice(0, 8)} />;
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

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 md:grid-cols-5 lg:grid-cols-9" role="status" aria-label="Loading categories">
      {CATEGORIES.map((c) => (
        <div key={c.value} className="skeleton-shimmer h-[7.5rem] rounded-card bg-muted" />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />

      <div className="container-page space-y-12 pt-2 pb-8 sm:space-y-16 sm:pb-12">
        <BudgetChips />

        <section aria-labelledby="browse-categories" className="space-y-5">
          <SectionHeading
            id="browse-categories"
            title="Browse categories"
            action={{ label: "All items", href: "/marketplace" }}
          />
          <Suspense fallback={<CategoriesSkeleton />}>
            <Categories />
          </Suspense>
        </section>

        <Suspense
          fallback={
            <div className="space-y-5">
              <div className="skeleton-shimmer h-8 w-56 rounded-full bg-muted" />
              <ListingRowSkeleton count={4} />
            </div>
          }
        >
          <Deals />
        </Suspense>

        <section aria-labelledby="recently-listed" className="space-y-5">
          <SectionHeading
            id="recently-listed"
            title="Recently listed"
            description="Fresh finds from students and families near you."
            action={{ label: "View all", href: "/marketplace" }}
          />
          <Suspense fallback={<ListingGridSkeleton count={8} />}>
            <RecentlyListed />
          </Suspense>
        </section>

        <section aria-labelledby="fresh-near-you">{isSupabaseConfigured ? <FreshNearYou /> : null}</section>

        <HowItWorks />

        <Suspense fallback={<div className="skeleton-shimmer h-64 rounded-card bg-green-tint" />}>
          <ImpactStrip />
        </Suspense>

        <SafetyTips />

        <section
          aria-labelledby="cta"
          className="relative overflow-hidden rounded-card bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12 sm:py-16"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10"
          />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-saffron/20" />
          <FadeIn className="relative">
            <h2 id="cta" className="mx-auto max-w-2xl text-[1.75rem] leading-tight font-extrabold sm:text-[2.5rem]">
              That calculator from first year deserves another semester.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[0.95rem] text-primary-foreground/85">
              Listing takes about two minutes. Buyers message you directly — no fees, no commission, ever.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="saffron">
                <Link href="/sell">
                  <Plus /> List an item free
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-primary-foreground ring-1 ring-primary-foreground/40 hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link href="/marketplace">
                  Browse deals <ArrowRight />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </section>
      </div>
    </>
  );
}
