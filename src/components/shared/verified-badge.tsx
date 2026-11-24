import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className, label = "Verified email" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-green-tint px-2 py-0.5 text-[0.72rem] font-semibold text-primary",
        className,
      )}
      title="This member has confirmed their email address"
    >
      <BadgeCheck className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
