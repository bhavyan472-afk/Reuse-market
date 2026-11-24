import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { SetupNotice } from "@/components/shared/setup-notice";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { env, isSupabaseConfigured } from "@/lib/env";
import { getFavoriteIds, getUnreadTotal } from "@/lib/queries";
import { getProfile, getUser } from "@/lib/supabase/server";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["second hand", "used", "marketplace", "students", "India", "buy", "sell", "campus"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F4" },
    { media: "(prefers-color-scheme: dark)", color: "#121412" },
  ],
  width: "device-width",
  initialScale: 1,
};

async function loadSession() {
  const user = await getUser();
  if (!user) return { session: { userId: null, fullName: null, avatarUrl: null }, favoriteIds: [], unread: 0, saved: null };
  const [profile, favoriteIds, unread] = await Promise.all([
    getProfile(user.id),
    getFavoriteIds(user.id).catch(() => []),
    getUnreadTotal().catch(() => 0),
  ]);
  const saved =
    profile?.lat !== null && profile?.lat !== undefined && profile.lng !== null ? { lat: profile.lat, lng: profile.lng } : null;
  return {
    session: {
      userId: user.id,
      fullName: profile?.full_name || user.email?.split("@")[0] || null,
      avatarUrl: profile?.avatar_url ?? null,
    },
    favoriteIds,
    unread,
    saved,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { session, favoriteIds, unread, saved } = await loadSession();

  return (
    // Font variables live on <html> so `font-sans` on the root element can resolve them.
    <html lang="en-IN" className={jakarta.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <AppProviders session={session} favoriteIds={favoriteIds} unreadTotal={unread} savedLocation={saved}>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            {!isSupabaseConfigured && <SetupNotice />}
            <main id="main" className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
            <SiteFooter />
          </div>
          <MobileNav />
        </AppProviders>
      </body>
    </html>
  );
}
