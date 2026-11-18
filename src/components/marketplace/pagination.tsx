import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buildMarketQuery, type MarketFilters } from "@/lib/search-params";
import { cn } from "@/lib/utils";

function pages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({ filters, totalPages }: { filters: MarketFilters; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (page: number) => `/marketplace${buildMarketQuery({ ...filters, page })}`;
  const current = Math.min(filters.page, totalPages);
  const base =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-[3px] border border-border bg-card px-3 text-sm transition-colors hover:border-foreground/25";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 pt-10">
      {current > 1 ? (
        <Link href={href(current - 1)} className={base} aria-label="Previous page" rel="prev">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, "opacity-40")} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {pages(current, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === current ? "page" : undefined}
            className={cn(base, p === current && "border-primary bg-primary text-primary-foreground hover:border-primary")}
          >
            {p}
          </Link>
        ),
      )}
      {current < totalPages ? (
        <Link href={href(current + 1)} className={base} aria-label="Next page" rel="next">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, "opacity-40")} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
