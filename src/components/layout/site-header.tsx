"use client";

import { Heart, LayoutDashboard, LogOut, MessageCircle, Plus, User } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/#how-it-works", label: "How it works" },
];

export function UnreadDot({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 grid min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] leading-[18px] font-semibold text-ink ring-2 ring-background",
        className,
      )}
      aria-label={`${count} unread messages`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function SiteHeader() {
  const { userId, fullName, avatarUrl } = useSession();
  const { total } = useUnread();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Transparent over the home hero; solid with blur once the page scrolls.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const overHero = pathname === "/" && !scrolled;

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
    <header
      data-over-hero={overHero || undefined}
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ease-out",
        overHero ? "border-transparent bg-transparent" : "glass border-border/80",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:shadow-soft"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <div className="flex items-center gap-10">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname.startsWith(item.href) && item.href !== "/#how-it-works" ? "page" : undefined}
                className="link-underline rounded-[2px] py-1 text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background aria-[current=page]:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
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
              <Button asChild className="hidden md:inline-flex">
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
                  <DropdownMenuLabel className="truncate font-serif text-base font-normal">{fullName || "Your account"}</DropdownMenuLabel>
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
                      <MessageCircle /> Messages {total > 0 && <span className="ml-auto text-xs text-gold-text">{total}</span>}
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
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href={`/login?next=${encodeURIComponent(pathname)}`}>Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Join</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
