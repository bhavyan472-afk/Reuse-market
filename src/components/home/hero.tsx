"use client";

import { Loader2, LocateFixed, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { useViewerLocation } from "@/components/providers/location-provider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import { buildMarketQuery } from "@/lib/search-params";
import type { ListingCategory } from "@/lib/supabase/database.types";

const PLATE_MAIN = {
  src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
  alt: "An emerald velvet sofa in a sunlit room",
};
const PLATE_DETAIL = {
  src: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80",
  alt: "A stack of well-read books",
};

/** Staggered entrance via CSS (starts at first paint, before hydration; reduced-motion safe). */
const rise = (ms: number): CSSProperties => ({ ["--delay" as string]: `${ms}ms` });

export function Hero() {
  const router = useRouter();
  const { location, requestLocation, locating } = useViewerLocation();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<ListingCategory | "all">("all");
  const [where, setWhere] = useState<"anywhere" | "near">("anywhere");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let point = location;
    if (where === "near" && !point) {
      point = await requestLocation();
      if (!point) {
        toast.error("We couldn't get your location — showing results from everywhere instead.");
      }
    }
    const near = where === "near" && point;
    router.push(
      `/marketplace${buildMarketQuery({
        q: q.trim(),
        category: category === "all" ? null : category,
        lat: near ? point!.lat : null,
        lng: near ? point!.lng : null,
        radius: near ? 25 : null,
        sort: near ? "nearest" : "newest",
      })}`,
    );
  };

  return (
    // Pulled up under the (transparent) navbar so the hero band reads as one surface.
    <section className="relative -mt-16 overflow-hidden border-b border-border bg-secondary/55 md:-mt-[72px]">
      <div className="container-page grid gap-14 pt-28 pb-16 sm:pt-32 md:pt-40 lg:grid-cols-12 lg:gap-10 lg:pb-28">
        {/* ------------------------------------------------ copy + search (cols 1–7) */}
        <div className="lg:col-span-7 lg:pr-6">
          <p className="eyebrow animate-rise" style={rise(0)}>
            The campus &amp; community resale house
          </p>

          <h1 className="display mt-7 text-[3.15rem] text-forest sm:text-7xl lg:text-[6.4rem]">
            <span className="block animate-rise" style={rise(120)}>
              Give products
            </span>
            <span className="block animate-rise" style={rise(240)}>
              a second <em className="font-normal text-gold italic">life.</em>
            </span>
          </h1>

          <p className="mt-8 max-w-[34rem] animate-rise text-base leading-relaxed text-muted-foreground sm:text-[1.075rem]" style={rise(380)}>
            Thoughtfully pre-owned books, laptops, bicycles and furniture from students and neighbours nearby. Buy for less,
            sell in minutes, and keep good things in use.
          </p>

          <form
            onSubmit={submit}
            role="search"
            aria-label="Search listings"
            className="mt-10 animate-rise rounded-[4px] border border-border bg-card p-2 shadow-soft transition-shadow duration-300 focus-within:shadow-lift"
            style={rise(560)}
          >
            <label className="relative flex items-center border-b border-border">
              <span className="sr-only">What are you looking for?</span>
              <Search className="pointer-events-none absolute left-4 size-[18px] text-muted-foreground" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try “MacBook”, “cycle”, “Grewal”…"
                maxLength={100}
                className="h-14 w-full bg-transparent pr-4 pl-12 text-[0.98rem] outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
              />
            </label>
            <div className="grid gap-2 pt-2 sm:grid-cols-[1fr_1fr_auto]">
              <Select value={category} onValueChange={(v) => setCategory(v as ListingCategory | "all")}>
                <SelectTrigger aria-label="Category" className="h-12 w-full justify-start border-0 bg-secondary/70 [&>svg:last-child]:ml-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={where} onValueChange={(v) => setWhere(v as "anywhere" | "near")}>
                <SelectTrigger aria-label="Location" className="h-12 w-full justify-start border-0 bg-secondary/70 [&>svg:last-child]:ml-auto">
                  <LocateFixed className="size-4 text-gold-text" aria-hidden />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anywhere">Anywhere</SelectItem>
                  <SelectItem value="near">Near me · 25 km</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" size="lg" className="h-12 uppercase" disabled={locating}>
                {locating ? <Loader2 className="animate-spin" /> : <Search />}
                Search
              </Button>
            </div>
          </form>

          <dl className="mt-11 grid max-w-xl animate-fade grid-cols-3 divide-x divide-border border-y border-border text-sm" style={rise(760)}>
            {[
              ["Fee to list", "₹0"],
              ["Typical saving", "40–70%"],
              ["Payments", "In person"],
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-4 first:pl-0">
                <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">{label}</dt>
                <dd className="mt-1.5 font-serif text-[1.65rem] leading-none text-forest">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ------------------------------------------------ editorial plates (cols 8–12) */}
        <figure aria-hidden className="relative mx-auto hidden w-full max-w-[460px] animate-fade sm:block lg:col-span-5 lg:mt-6" style={rise(200)}>
          <div className="relative ml-auto w-[86%] border border-border bg-card p-3 shadow-soft">
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <Image src={PLATE_MAIN.src} alt="" fill priority sizes="(min-width: 1024px) 400px, 70vw" className="object-cover" />
            </div>
            <figcaption className="flex items-baseline justify-between gap-3 pt-3 text-[0.7rem] text-muted-foreground">
              <span className="font-semibold tracking-[0.22em] uppercase">Plate No. 04</span>
              <span className="font-serif text-sm italic">Velvet, three-seater, much loved</span>
            </figcaption>
          </div>
          <div className="absolute top-[46%] -left-2 w-[40%] border border-border bg-card p-2 shadow-lift sm:-left-6">
            <div className="relative aspect-square overflow-hidden bg-secondary">
              <Image src={PLATE_DETAIL.src} alt="" fill sizes="200px" className="object-cover" />
            </div>
          </div>
          <span className="numeral absolute -top-7 left-[6%] text-[5.5rem] text-gold/70 select-none">№</span>
        </figure>
      </div>
    </section>
  );
}
