import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { CITIES } from "@/lib/cities";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";
import { env } from "@/lib/env";
import { buildMarketQuery } from "@/lib/search-params";

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
const FOOTER_CITIES = ["Bengaluru", "Delhi", "Mumbai", "Pune", "Hyderabad", "Chennai", "Kolkata", "Jaipur"]
  .map((name) => CITIES.find((c) => c.name === name))
  .filter((c): c is NonNullable<typeof c> => !!c);

/**
 * Official social profiles. Add the real URLs here and they appear in the footer;
 * entries left empty are not rendered (so no dead or wrong links ship).
 */
const SOCIAL_PROFILES: { label: string; href: string; icon: "instagram" }[] = [{ label: "Instagram", href: "", icon: "instagram" }];

function SocialIcon({ name }: { name: "whatsapp" | "x" | "instagram" }) {
  if (name === "whatsapp")
    return (
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1 0-.3-.1-.5-.2z" />
      </svg>
    );
  if (name === "x")
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.4l7.9-9L1 2h7l4.8 6.4L18.2 2zm-1.2 18h1.9L7.1 3.9H5.1L17 20z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-sm text-sm text-muted-foreground outline-none hover:text-primary focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-sm font-bold text-foreground">{children}</h2>;
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const shareText = encodeURIComponent(`Found this for buying & selling pre-owned stuff nearby — ${SITE_NAME}: ${env.siteUrl}`);
  const social = [
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${shareText}`, icon: "whatsapp" as const },
    { label: "Share on X", href: `https://x.com/intent/post?text=${shareText}`, icon: "x" as const },
    ...SOCIAL_PROFILES.filter((s) => s.href),
  ];

  return (
    <footer className="mt-8 border-t border-border bg-card pb-24 md:pb-0">
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.3fr_2fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            The friendly way for students and families across India to buy and sell pre-owned stuff nearby. Free to list,
            zero commission.
          </p>
          <ul className="flex gap-2" aria-label="Social">
            {social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="grid size-10 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors outline-none hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <SocialIcon name={s.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <ColumnTitle>Explore</ColumnTitle>
            <ul className="space-y-2.5">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ColumnTitle>Categories</ColumnTitle>
            <ul className="space-y-2.5">
              {CATEGORIES.map((c) => (
                <li key={c.value}>
                  <FooterLink href={`/marketplace?category=${c.value}`}>{c.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ColumnTitle>Cities</ColumnTitle>
            <ul className="space-y-2.5">
              {FOOTER_CITIES.map((c) => (
                <li key={c.name}>
                  <FooterLink href={`/marketplace${buildMarketQuery({ lat: c.lat, lng: c.lng, radius: 25, sort: "nearest" })}`}>
                    {c.name}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ColumnTitle>Account</ColumnTitle>
            <ul className="space-y-2.5">
              {ACCOUNT.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-1 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ReUse Market. Made in India 🇮🇳</p>
          <p>Meet in public · Inspect before you pay · Never share OTPs</p>
        </div>
      </div>
    </footer>
  );
}
