import { Wallet } from "lucide-react";
import Link from "next/link";
import { BUDGETS } from "@/lib/constants";
import { buildMarketQuery } from "@/lib/search-params";

/** "Shop by budget" chips — horizontal scroll on mobile; each links to the marketplace with a price filter. */
export function BudgetChips() {
  return (
    <nav aria-label="Shop by budget" className="flex items-center gap-3">
      <span className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-muted-foreground sm:inline-flex">
        <Wallet className="size-4" aria-hidden /> Shop by budget
      </span>
      <div className="no-scrollbar -mx-4 min-w-0 flex-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2">
          {BUDGETS.map((b) => (
            <li key={b.label}>
              <Link
                href={`/marketplace${buildMarketQuery({ minPrice: b.min, maxPrice: b.max, sort: "price_asc" })}`}
                className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold whitespace-nowrap shadow-soft transition-[background-color,border-color,color,transform] duration-200 outline-none hover:-translate-y-0.5 hover:border-primary hover:bg-green-tint hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {b.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
