"use client";

import { Heart, LayoutDashboard, LogOut, MessageCircle, Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useSession } from "@/components/providers/session-provider";
import { useUnread } from "@/components/providers/unread-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/auth";
import { buildMarketQuery } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function UnreadDot({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 grid min-w-[18px] place-items-center rounded-full bg-saffron px-1 text-[10px] leading-[18px] font-bold text-saffron-foreground ring-2 ring-card",
        className,
      )}
      aria-label={`${count} unread messages`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function HeaderSearch({ className, id }: { className?: string; id: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      aria-label="Search listings"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/marketplace${buildMarketQuery({ q: q.trim() })}`);
      }}
    >
      <label htmlFor={id} className="sr-only">
        Search ReUse Market
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        maxLength={100}
        placeholder="Search books, laptops, cycles…"
        className="h-11 w-full rounded-full border border-border bg-muted/70 pr-4 pl-11 text-sm transition-[background-color,border-color,box-shadow] outline-none placeholder:text-muted-foreground hover:border-foreground/15 focus-visible:border-primary focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/20"
      />
    </form>
  );
}

export function SiteHeader() {
  const { userId, fullName, avatarUrl } = useSession();
  const { total } = useUnread();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // On the homepage the hero has its own big search, so the navbar search appears once you scroll past it.
  const isHome = pathname === "/";
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setPastHero(window.scrollY > 380);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);
  // The marketplace page has its own search + filters bar.
  const showSearch = !pathname.startsWith("/marketplace") && (!isHome || pastHero);

  const handleSignOut = () =>
    startTransition(async () => {
      const res = await signOut();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("You've been signed out.");
      router.push("/");
      router.refresh();
    });

  return (
    <header className="glass sticky top-0 z-40 border-b border-border/80">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:shadow-soft"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center gap-3 md:gap-6">
        <Logo />

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <HeaderSearch
            id="header-q"
            className={cn(
              "w-full max-w-xl transition-[opacity,transform] duration-200",
              showSearch ? "opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
            )}
          />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
          <ThemeToggle />
          {userId ? (
            <>
              <Button asChild variant="ghost" size="icon" className="relative hidden md:inline-flex">
                <Link href="/saved" aria-label="Saved items">
                  <Heart className="size-[18px]" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="relative hidden md:inline-flex">
                <Link href="/messages" aria-label={total ? `Messages, ${total} unread` : "Messages"}>
                  <MessageCircle className="size-[18px]" />
                  <UnreadDot count={total} className="top-0.5 right-0.5" />
                </Link>
              </Button>
              <Button asChild variant="saffron" className="hidden md:inline-flex">
                <Link href="/sell">
                  <Plus /> Sell an item
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-1 rounded-full ring-offset-2 ring-offset-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-label="Account menu"
                  >
                    <UserAvatar name={fullName} src={avatarUrl} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
                  <DropdownMenuLabel className="truncate text-sm font-semibold">{fullName || "Your account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages">
                      <MessageCircle /> Messages{" "}
                      {total > 0 && <span className="ml-auto text-xs font-semibold text-saffron-ink">{total}</span>}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved">
                      <Heart /> Saved items
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut} disabled={pending}>
                    <LogOut /> {pending ? "Signing out…" : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="saffron" className="hidden md:inline-flex">
                <Link href="/sell">
                  <Plus /> Sell an item
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-10 px-4">
                <Link href={`/login?next=${encodeURIComponent(pathname)}`}>Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile: compact search row on browsing pages (home has the hero search; marketplace has its own). */}
      {((pathname.startsWith("/listings/") && !pathname.endsWith("/edit")) ||
        pathname.startsWith("/saved") ||
        pathname.startsWith("/users/")) && (
        <div className="container-page pb-3 md:hidden">
          <HeaderSearch id="header-q-mobile" />
        </div>
      )}
    </header>
  );
}
