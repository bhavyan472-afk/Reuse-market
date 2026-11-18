import { ExternalLink, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getProfile, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your profile", robots: { index: false } };

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/profile");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/login?next=/profile");

  const location =
    profile.lat !== null && profile.lng !== null && profile.location_address && profile.city
      ? { address: profile.location_address, city: profile.city, lat: profile.lat, lng: profile.lng }
      : null;

  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-4" /> {user.email}
            </span>
            {profile.email_verified && <VerifiedBadge />}
            <span>· Member since {formatDate(profile.created_at)}</span>
          </span>
        }
        actions={
          <Button asChild variant="outline">
            <Link href={`/users/${user.id}`}>
              Public profile <ExternalLink />
            </Link>
          </Button>
        }
      />
      <ProfileForm
        userId={user.id}
        defaultValues={{
          fullName: profile.full_name,
          phone: profile.phone ?? "",
          college: profile.college ?? "",
          bio: profile.bio ?? "",
          avatarUrl: profile.avatar_url,
          location,
        }}
      />
    </div>
  );
}
