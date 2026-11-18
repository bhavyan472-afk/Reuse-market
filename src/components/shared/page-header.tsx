import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 flex flex-col gap-5 border-b border-border pb-9 sm:flex-row sm:items-end sm:justify-between sm:pb-11", className)}>
      <div className="space-y-4">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display text-[2.7rem] text-forest sm:text-[4rem]">{title}</h1>
        {description && <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
