import Link from "next/link";
import { FadeIn } from "@/components/shared/fade-in";
import { CATEGORIES } from "@/lib/constants";
import type { ListingCategory } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

/** Category grid: rounded icon tiles with live item counts. 3 columns on phones, 9 in a row on desktop. */
export function CategoryChips({
  active,
  counts,
  className,
}: {
  active?: string | null;
  counts?: Partial<Record<ListingCategory, number>>;
  className?: string;
}) {
  return (
    <nav aria-label="Categories" className={className}>
      <ul className="grid grid-cols-3 gap-2.5 sm:gap-3 md:grid-cols-5 lg:grid-cols-9">
        {CATEGORIES.map(({ value, label, icon: Icon }, i) => {
          const isActive = active === value;
          const count = counts?.[value];
          return (
            <li key={value}>
              <FadeIn delay={i * 0.025} y={8} className="h-full">
                <Link
                  href={`/marketplace?category=${value}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "lift group flex h-full flex-col items-center gap-2 rounded-card border bg-card px-2 py-4 text-center shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                    isActive ? "border-primary" : "border-border",
                  )}
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-green-tint text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-sm leading-tight font-semibold">{label}</span>
                  {count ? (
                    <span className="text-xs text-muted-foreground">
                      {count.toLocaleString("en-IN")} {count === 1 ? "item" : "items"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Browse</span>
                  )}
                </Link>
              </FadeIn>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
