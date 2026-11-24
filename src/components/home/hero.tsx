"use client";

import { Handshake, IndianRupee, Loader2, LocateFixed, MapPin, PiggyBank, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { useViewerLocation } from "@/components/providers/location-provider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES } from "@/lib/cities";
import { CATEGORIES } from "@/lib/constants";
import { buildMarketQuery } from "@/lib/search-params";
import type { ListingCategory } from "@/lib/supabase/database.types";

const COLLAGE = [
  {
    src: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=75",
    alt: "A pre-owned laptop on a desk",
    tag: "Laptops",
  },
  {
    src: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=75",
    alt: "A stack of second-hand books",
    tag: "Books",
  },
  {
    src: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=75",
    alt: "A bicycle parked against a wall",
    tag: "Bicycles",
  },
];

const TRUST = [
  { icon: IndianRupee, value: "₹0", label: "listing fee" },
  { icon: PiggyBank, value: "Save 40–70%", label: "vs buying new" },
  { icon: Handshake, value: "Meet in person", label: "pay on the spot" },
];

/** Staggered entrance via CSS (starts at first paint, before hydration; reduced-motion safe). */
const rise = (ms: number): CSSProperties => ({ ["--delay" as string]: `${ms}ms` });

type Where = "anywhere" | "near" | `city:${string}`;

export function Hero() {
  const router = useRouter();
  const { location, requestLocation, locating } = useViewerLocation();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<ListingCategory | "all">("all");
  const [where, setWhere] = useState<Where>("anywhere");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let point: { lat: number; lng: number } | null = null;
    if (where === "near") {
      point = location ?? (await requestLocation());
      if (!point) toast.error("We couldn't get your location — showing results from everywhere instead.");
    } else if (where.startsWith("city:")) {
      const city = CITIES.find((c) => c.name === where.slice(5));
      if (city) point = { lat: city.lat, lng: city.lng };
    }
    router.push(
      `/marketplace${buildMarketQuery({
        q: q.trim(),
        category: category === "all" ? null : category,
        lat: point ? point.lat : null,
        lng: point ? point.lng : null,
        radius: point ? 25 : null,
        sort: point ? "nearest" : undefined,
      })}`,
    );
  };

  return (
    <section className="relative overflow-hidden">
      {/* soft warm/green wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_85%_-10%,var(--green-tint),transparent_70%),radial-gradient(32rem_22rem_at_-5%_45%,var(--saffron-tint),transparent_70%)]"
      />
      <div className="container-page grid items-center gap-8 pt-8 pb-10 sm:pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pt-16 lg:pb-20">
        {/* ------------------------------------------------ copy + search */}
        <div className="min-w-0">
          <p className="eyebrow animate-rise" style={rise(0)}>
            <span aria-hidden>🌱</span> Pre-owned, near you
          </p>

          <h1
            className="display mt-4 animate-rise text-[2.15rem] text-foreground min-[400px]:text-[2.4rem] sm:text-5xl lg:text-[3.6rem]"
            style={rise(40)}
          >
            Good stuff. <span className="text-primary">Half the price.</span> Right next door.
          </h1>

          <p className="mt-4 max-w-[34rem] animate-rise text-[0.98rem] leading-relaxed text-muted-foreground sm:text-lg" style={rise(80)}>
            Buy and sell pre-owned books, laptops, phones, cycles and more with students and families in your city. No
            listing fees, no commission.
          </p>

          <form
            onSubmit={submit}
            role="search"
            aria-label="Search listings"
            className="mt-6 animate-rise rounded-card border border-border bg-card p-2 shadow-lift sm:mt-8"
            style={rise(120)}
          >
            <div className="flex flex-col gap-2">
              <label className="relative flex min-w-0 flex-1 items-center">
                <span className="sr-only">What are you looking for?</span>
                <Search className="pointer-events-none absolute left-4 size-5 text-muted-foreground" aria-hidden />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Try “calculator”, “cycle”, “iPhone”…"
                  maxLength={100}
                  className="h-12 w-full rounded-input bg-transparent pr-3 pl-12 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/25"
                />
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Select value={category} onValueChange={(v) => setCategory(v as ListingCategory | "all")}>
                  <SelectTrigger aria-label="Category" className="h-12! w-full min-w-0 border-0 bg-muted">
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
                <Select value={where} onValueChange={(v) => setWhere(v as Where)}>
                  <SelectTrigger aria-label="Location" className="h-12! w-full min-w-0 border-0 bg-muted">
                    <MapPin className="size-4 text-primary" aria-hidden />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anywhere">All of India</SelectItem>
                    <SelectItem value="near">
                      <LocateFixed className="text-primary" aria-hidden /> Near me
                    </SelectItem>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Cities</SelectLabel>
                      {CITIES.map((c) => (
                        <SelectItem key={c.name} value={`city:${c.name}`}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              <Button type="submit" variant="saffron" size="lg" className="col-span-2 h-12 sm:col-span-1 sm:px-6" disabled={locating}>
                {locating ? <Loader2 className="animate-spin" /> : <Search />}
                Search
              </Button>
              </div>
            </div>
          </form>

          <ul className="mt-6 grid animate-fade grid-cols-3 gap-2 sm:gap-3" style={rise(200)} aria-label="Why ReUse Market">
            {TRUST.map(({ icon: Icon, value, label }) => (
              <li key={value} className="flex flex-col gap-1 rounded-2xl bg-card/70 p-2.5 sm:flex-row sm:items-center sm:gap-2.5 sm:p-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-green-tint text-primary sm:size-9">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[0.8rem] font-bold sm:text-sm">{value}</span>
                  <span className="block text-[0.7rem] text-muted-foreground sm:text-xs">{label}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ------------------------------------------------ product collage */}
        <figure className="relative animate-fade" style={rise(80)}>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-2 lg:grid-rows-2 lg:gap-4">
            {COLLAGE.map((img, i) => (
              <div
                key={img.src}
                className={
                  i === 0
                    ? "relative aspect-square overflow-hidden rounded-card bg-muted shadow-soft lg:row-span-2 lg:aspect-auto lg:min-h-[420px]"
                    : "relative aspect-square overflow-hidden rounded-card bg-muted shadow-soft lg:aspect-[5/4]"
                }
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={i === 0}
                  sizes={i === 0 ? "(min-width: 1024px) 280px, 33vw" : "(min-width: 1024px) 260px, 33vw"}
                  className="object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-card/95 px-2.5 py-1 text-[0.7rem] font-semibold shadow-soft sm:text-xs">
                  {img.tag}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute -top-3 right-3 hidden items-center gap-2 rounded-full bg-saffron px-3.5 py-2 text-sm font-bold text-saffron-foreground shadow-lift sm:flex lg:top-6 lg:-left-5 lg:right-auto">
            <PiggyBank className="size-4" aria-hidden /> Save 40–70% vs new
          </div>
          <figcaption className="sr-only">Pre-owned laptops, books and bicycles listed on ReUse Market</figcaption>
        </figure>
      </div>
    </section>
  );
}
