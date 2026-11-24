"use client";

import { Home, MessageCircle, Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { useUnread } from "@/components/providers/unread-provider";
import { cn } from "@/lib/utils";
import { UnreadDot } from "./site-header";

export function MobileNav() {
  const pathname = usePathname();
  const { userId } = useSession();
  const { total } = useUnread();

  const items = [
    { href: "/", label: "Home", icon: Home, active: pathname === "/" },
    { href: "/marketplace", label: "Browse", icon: Search, active: pathname.startsWith("/marketplace") },
    { href: "/sell", label: "Sell", icon: Plus, active: pathname.startsWith("/sell"), primary: true },
    { href: "/messages", label: "Inbox", icon: MessageCircle, active: pathname.startsWith("/messages"), badge: total },
    {
      href: userId ? "/dashboard" : "/login",
      label: userId ? "Account" : "Sign in",
      icon: User,
      active: ["/dashboard", "/profile", "/saved", "/login"].some((p) => pathname.startsWith(p)),
    },
  ];

  return (
    <nav
      aria-label="Mobile"
      className="glass pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border/70 md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label} className="flex justify-center">
              <Link
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[0.68rem] font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  item.active ? "font-semibold text-primary" : "text-muted-foreground",
                )}
              >
                {item.primary ? (
                  <span className="-mt-5 grid size-12 place-items-center rounded-full bg-saffron text-saffron-foreground shadow-lift ring-4 ring-card transition-colors active:bg-saffron-hover">
                    <Icon className="size-5" />
                  </span>
                ) : (
                  <span className="relative">
                    <Icon className="size-5" strokeWidth={item.active ? 2.25 : 1.75} />
                    {item.badge ? <UnreadDot count={item.badge} /> : null}
                  </span>
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
