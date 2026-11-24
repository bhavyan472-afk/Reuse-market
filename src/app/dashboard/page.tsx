import { Eye, Heart, Package, PackageCheck, Plus, Store } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OwnerActions } from "@/components/listings/owner-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/constants";
import { formatPrice, timeAgo } from "@/lib/format";
import { getMyListings, type MyListing } from "@/lib/queries";
import { getProfile, getUser } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Seller dashboard", robots: { index: false } };

function StatusBadge({ listing }: { listing: MyListing }) {
  if (listing.is_hidden)
    return <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">Hidden</span>;
  return listing.status === "sold" ? (
    <span className="rounded-full bg-gold/20 px-2.5 py-1 text-xs font-semibold tracking-wide text-gold-text">Sold</span>
  ) : (
    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-brand">Active</span>
  );
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/dashboard");
  const [listings, profile] = await Promise.all([getMyListings(user.id), getProfile(user.id)]);

  const stats = [
    { label: "Total listings", value: listings.length, icon: Store },
    { label: "Active", value: listings.filter((l) => l.status === "available").length, icon: Package },
    { label: "Sold", value: listings.filter((l) => l.status === "sold").length, icon: PackageCheck },
    { label: "Total views", value: listings.reduce((s, l) => s + l.views, 0), icon: Eye },
    { label: "Times saved", value: listings.reduce((s, l) => s + l.favorites_count, 0), icon: Heart },
  ];

  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Seller dashboard"
        title={firstName ? `Hello, ${firstName}` : "Your listings"}
        description="Track how your items are doing, update prices and mark things sold."
        actions={
          <Button asChild size="lg">
            <Link href="/sell">
              <Plus /> New listing
            </Link>
          </Button>
        }
      />

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border bg-card p-5">
            <dt className="flex items-center gap-2 text-xs text-muted-foreground">
              <s.icon className="size-4 text-gold-text" aria-hidden /> {s.label}
            </dt>
            <dd className="numeral mt-2 text-3xl">{s.value.toLocaleString("en-IN")}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="my-listings" className="mt-12">
        <h2 id="my-listings" className="mb-5 text-xl font-bold">
          My listings
        </h2>
        {listings.length === 0 ? (
          <EmptyState
            title="You haven't listed anything yet"
            description="Clear some space and earn a little — list your first item for free."
            action={{ label: "List an item", href: "/sell" }}
          />
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-hidden rounded-3xl border border-border bg-card lg:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Item</th>
                    <th scope="col" className="px-3 py-3 font-medium">Price</th>
                    <th scope="col" className="px-3 py-3 font-medium">Status</th>
                    <th scope="col" className="px-3 py-3 font-medium">Views</th>
                    <th scope="col" className="px-3 py-3 font-medium">Saved</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {listings.map((l) => (
                    <tr key={l.id} className={cn(l.status === "sold" && "bg-muted/30")}>
                      <td className="px-5 py-4">
                        <Link href={`/listings/${l.id}`} className="flex items-center gap-4 hover:underline">
                          <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                            {l.cover_url && <Image src={l.cover_url} alt="" fill sizes="56px" className="object-cover" />}
                          </span>
                          <span className="min-w-0">
                            <span className="line-clamp-1 font-medium">{l.title}</span>
                            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                              {categoryLabel(l.category)} · listed {timeAgo(l.created_at)}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="price px-3 py-4 text-sm">{formatPrice(l.price)}</td>
                      <td className="px-3 py-4"><StatusBadge listing={l} /></td>
                      <td className="px-3 py-4 tabular-nums">{l.views.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-4 tabular-nums">{l.favorites_count.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <OwnerActions listingId={l.id} status={l.status} title={l.title} layout="row" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile / tablet cards */}
            <ul className="grid gap-4 sm:grid-cols-2 lg:hidden">
              {listings.map((l) => (
                <li key={l.id} className="rounded-3xl border border-border bg-card p-4">
                  <Link href={`/listings/${l.id}`} className="flex gap-4">
                    <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
                      {l.cover_url && <Image src={l.cover_url} alt="" fill sizes="80px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 space-y-1">
                      <span className="line-clamp-2 font-medium">{l.title}</span>
                      <span className="price block text-base">{formatPrice(l.price)}</span>
                    </span>
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <StatusBadge listing={l} />
                    <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {l.views}</span>
                    <span className="inline-flex items-center gap-1"><Heart className="size-3.5" /> {l.favorites_count}</span>
                  </div>
                  <div className="mt-4">
                    <OwnerActions listingId={l.id} status={l.status} title={l.title} layout="row" />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
