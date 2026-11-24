import { CalendarDays, GraduationCap, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingGrid } from "@/components/listings/listing-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { formatDate } from "@/lib/format";
import { getPublicProfile, searchListings } from "@/lib/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) notFound();
  return { title: `${profile.full_name || "Member"}'s listings`, description: profile.bio ?? undefined };
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) notFound();
  const [active, sold] = await Promise.all([
    searchListings({ sellerId: id, sort: "newest" }, { limit: 60, offset: 0 }),
    searchListings({ sellerId: id, availableOnly: false, sort: "newest" }, { limit: 60, offset: 0 }),
  ]);
  const soldItems = sold.items.filter((l) => l.status === "sold");

  return (
    <div className="container-page py-10 sm:py-14">
      <section className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 sm:flex-row sm:items-center">
        <UserAvatar name={profile.full_name} src={profile.avatar_url} className="size-24 text-3xl" />
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold">{profile.full_name || "ReUse member"}</h1>
            {profile.email_verified && <VerifiedBadge />}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5"><CalendarDays className="size-4" /> Member since {formatDate(profile.created_at)}</li>
            {profile.college && <li className="flex items-center gap-1.5"><GraduationCap className="size-4" /> {profile.college}</li>}
            {profile.city && <li className="flex items-center gap-1.5"><MapPin className="size-4" /> {profile.city}</li>}
          </ul>
          {profile.bio && <p className="max-w-2xl leading-relaxed text-foreground/85">{profile.bio}</p>}
        </div>
      </section>

      <section className="mt-12 space-y-6" aria-labelledby="active-listings">
        <h2 id="active-listings" className="text-2xl font-bold">
          Active listings <span className="text-muted-foreground">({active.total})</span>
        </h2>
        {active.items.length ? (
          <ListingGrid listings={active.items} priorityCount={4} />
        ) : (
          <EmptyState title="No active listings" description="Check back soon — new items appear all the time." />
        )}
      </section>

      {soldItems.length > 0 && (
        <section className="mt-16 space-y-6" aria-labelledby="sold-listings">
          <h2 id="sold-listings" className="text-xl font-bold text-muted-foreground">
            Recently sold
          </h2>
          <ListingGrid listings={soldItems} />
        </section>
      )}
    </div>
  );
}
