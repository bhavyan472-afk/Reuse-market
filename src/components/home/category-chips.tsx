import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryChips({ active, className }: { active?: string | null; className?: string }) {
  return (
    <nav aria-label="Categories" className={cn("no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0", className)}>
      <ul className="flex w-max gap-2.5 sm:w-auto sm:flex-wrap">
        {CATEGORIES.map(({ value, label, icon: Icon }) => (
          <li key={value}>
            <Link
              href={`/marketplace?category=${value}`}
              aria-current={active === value ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                active === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-secondary/60",
              )}
            >
              <Icon className={cn("size-4", active === value ? "text-gold" : "text-brand")} aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
