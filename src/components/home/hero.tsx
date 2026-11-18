"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Loader2, LocateFixed, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useViewerLocation } from "@/components/providers/location-provider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, SITE_TAGLINE } from "@/lib/constants";
import { buildMarketQuery } from "@/lib/search-params";
import type { ListingCategory } from "@/lib/supabase/database.types";

const COLLAGE = [
  { src: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=700&q=80", alt: "Silver laptop on a desk" },
  { src: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=700&q=80", alt: "White single-speed bicycle" },
  { src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80", alt: "Emerald velvet sofa" },
  { src: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80", alt: "Stack of books" },
];

export function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
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

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="container-page grid items-center gap-12 pt-10 pb-14 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:pt-20 lg:pb-24">
        <div>
          <motion.p {...fade(0)} className="eyebrow">
            The campus &amp; community resale house
          </motion.p>
          <motion.h1
            {...fade(0.08)}
            className="display mt-5 text-[2.6rem] text-balance sm:text-6xl lg:text-[4.5rem]"
          >
            {SITE_TAGLINE.replace(".", "")}
            <span className="text-gold-text">.</span>
          </motion.h1>
          <motion.p {...fade(0.16)} className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-[1.075rem]">
            Thoughtfully pre-owned books, laptops, bicycles and furniture from students and neighbours nearby. Buy for
            less, sell in minutes, and keep good things in use.
          </motion.p>

          <motion.form
            {...fade(0.24)}
            onSubmit={submit}
            role="search"
            aria-label="Search listings"
            className="mt-9 rounded-[22px] border border-border bg-card p-2 shadow-soft transition-shadow focus-within:shadow-lift"
          >
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
              <label className="relative flex items-center sm:col-span-3">
                <span className="sr-only">What are you looking for?</span>
                <Search className="pointer-events-none absolute left-4 size-[18px] text-muted-foreground" aria-hidden />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Try “MacBook”, “cycle”, “Grewal”…"
                  maxLength={100}
                  className="h-12 w-full rounded-full bg-transparent pr-4 pl-11 text-[0.95rem] outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
                />
              </label>
              <Select value={category} onValueChange={(v) => setCategory(v as ListingCategory | "all")}>
                <SelectTrigger aria-label="Category" className="h-12 w-full justify-start rounded-full border-0 bg-secondary/70 [&>svg:last-child]:ml-auto">
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
                <SelectTrigger aria-label="Location" className="h-12 w-full justify-start rounded-full border-0 bg-secondary/70 [&>svg:last-child]:ml-auto">
                  <LocateFixed className="size-4 text-brand" aria-hidden />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anywhere">Anywhere</SelectItem>
                  <SelectItem value="near">Near me · 25 km</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" size="lg" className="h-12" disabled={locating}>
                {locating ? <Loader2 className="animate-spin" /> : <Search />}
                Search
              </Button>
            </div>
          </motion.form>

          <motion.dl {...fade(0.32)} className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6 text-sm">
            <div>
              <dt className="text-muted-foreground">Fee to list</dt>
              <dd className="font-serif text-2xl">₹0</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Typical saving</dt>
              <dd className="font-serif text-2xl">40–70%</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Payments</dt>
              <dd className="font-serif text-2xl">In person</dd>
            </div>
          </motion.dl>
        </div>

        {/* product collage */}
        <div aria-hidden className="relative mx-auto hidden w-full max-w-[520px] sm:block">
          <div className="grid grid-cols-2 gap-4">
            {COLLAGE.map((img, i) => (
              <motion.div
                key={img.src}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={i % 2 === 1 ? "mt-12" : ""}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
                  <Image src={img.src} alt={img.alt} fill priority={i < 2} sizes="(min-width: 1024px) 260px, 45vw" className="object-cover" />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="absolute -bottom-5 left-1/2 flex w-max -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm shadow-soft">
            <span className="size-1.5 rounded-full bg-gold" /> Fresh listings from verified students every day
          </div>
        </div>
      </div>
    </section>
  );
}
