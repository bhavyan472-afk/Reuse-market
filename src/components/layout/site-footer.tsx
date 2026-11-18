import Link from "next/link";
import { LogoMark } from "@/components/shared/logo";
import { CATEGORIES, SITE_TAGLINE } from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-28 border-t border-border bg-secondary/45 pb-24 md:pb-0">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr] lg:py-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-serif text-2xl">ReUse Market</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {SITE_TAGLINE} A calmer way for students and neighbours to pass on things worth keeping.
          </p>
        </div>
        <div>
          <h2 className="eyebrow mb-4 font-sans">Explore</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="text-muted-foreground hover:text-foreground" href="/marketplace">Marketplace</Link></li>
            <li><Link className="text-muted-foreground hover:text-foreground" href="/marketplace?view=map">Map view</Link></li>
            <li><Link className="text-muted-foreground hover:text-foreground" href="/sell">Sell an item</Link></li>
            <li><Link className="text-muted-foreground hover:text-foreground" href="/#how-it-works">How it works</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="eyebrow mb-4 font-sans">Categories</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.value}>
                <Link className="text-muted-foreground hover:text-foreground" href={`/marketplace?category=${c.value}`}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow mb-4 font-sans">Account</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="text-muted-foreground hover:text-foreground" href="/dashboard">Seller dashboard</Link></li>
            <li><Link className="text-muted-foreground hover:text-foreground" href="/messages">Messages</Link></li>
            <li><Link className="text-muted-foreground hover:text-foreground" href="/saved">Saved items</Link></li>
            <li><Link className="text-muted-foreground hover:text-foreground" href="/profile">Profile</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ReUse Market. Made for campuses and communities.</p>
          <p>Meet in public places · Inspect before you pay · Never share OTPs</p>
        </div>
      </div>
    </footer>
  );
}
