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
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[0.65rem] font-medium transition-colors",
                  item.active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.primary ? (
                  <span className="-mt-5 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft ring-4 ring-background transition-colors active:bg-forest-deep">
                    <Icon className="size-5" />
                  </span>
                ) : (
                  <span className="relative">
                    <Icon className={cn("size-5", item.active && "text-brand")} />
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
