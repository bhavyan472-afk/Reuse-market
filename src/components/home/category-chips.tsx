import Link from "next/link";
import { FadeIn } from "@/components/shared/fade-in";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Editorial category tiles: numbered index, gold line icon, serif label; lift + gold rule on hover. */
export function CategoryChips({ active, className }: { active?: string | null; className?: string }) {
  return (
    <nav aria-label="Categories" className={cn("no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:overflow-visible sm:px-0", className)}>
      <ul className="flex w-max gap-3 sm:grid sm:w-auto sm:grid-cols-3 sm:gap-4 lg:grid-cols-9 lg:gap-3">
        {CATEGORIES.map(({ value, label, icon: Icon }, i) => {
          const isActive = active === value;
          return (
            <li key={value} className="w-[8.5rem] sm:w-auto">
              <FadeIn delay={i * 0.05} y={10} className="h-full">
                <Link
                  href={`/marketplace?category=${value}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "lift group relative flex h-full flex-col justify-between gap-6 rounded-[4px] border bg-card px-4 pt-4 pb-4 outline-none hover:shadow-soft focus-visible:ring-3 focus-visible:ring-ring/40",
                    isActive ? "border-primary" : "border-border hover:border-foreground/25",
                  )}
                >
                  <span className="flex items-start justify-between">
                    <Icon className="size-5 text-gold-text" strokeWidth={1.4} aria-hidden />
                    <span className="font-serif text-xs text-muted-foreground italic" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="font-serif text-[1.3rem] leading-none">{label}</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100"
                  />
                </Link>
              </FadeIn>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
