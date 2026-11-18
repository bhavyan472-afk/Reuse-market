import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

const EXPLORE = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/marketplace?view=map", label: "Map view" },
  { href: "/sell", label: "Sell an item" },
  { href: "/#how-it-works", label: "How it works" },
];
const ACCOUNT = [
  { href: "/dashboard", label: "Seller dashboard" },
  { href: "/messages", label: "Messages" },
  { href: "/saved", label: "Saved items" },
  { href: "/profile", label: "Profile" },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link-underline rounded-[2px] text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
      {children}
    </Link>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-5 font-sans text-[0.66rem] leading-none font-semibold tracking-[0.24em] text-gold-text uppercase">{children}</h2>;
}

/** Masthead-style footer: oversized serif wordmark, fine rules, ruled link columns, colophon. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-border bg-secondary/45 pb-24 md:pb-0">
      <div className="container-page pt-16 sm:pt-24">
        <div className="flex flex-col gap-6 border-b border-border pb-12 lg:flex-row lg:items-end lg:justify-between">
          <p className="display text-[3.4rem] text-forest sm:text-[6rem] lg:text-[7.5rem]" aria-label="ReUse Market">
            ReUse<span className="text-gold">.</span> <span className="font-normal italic">Market</span>
          </p>
          <p className="max-w-sm font-serif text-xl leading-snug text-muted-foreground italic lg:pb-4">
            A calmer way for students and neighbours to pass on things worth keeping.
          </p>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <ColumnTitle>Explore</ColumnTitle>
            <ul className="space-y-3">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <ColumnTitle>Categories</ColumnTitle>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <li key={c.value}>
                  <FooterLink href={`/marketplace?category=${c.value}`}>{c.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <ColumnTitle>Account</ColumnTitle>
            <ul className="space-y-3">
              {ACCOUNT.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <ColumnTitle>Good practice</ColumnTitle>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Meet in public places</li>
              <li>Inspect before you pay</li>
              <li>Never share OTPs</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-[0.7rem] tracking-[0.14em] text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ReUse Market</p>
          <p>Made for campuses &amp; communities · Est. MMXXVI</p>
        </div>
      </div>
    </footer>
  );
}
