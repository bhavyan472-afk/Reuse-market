"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FavoritesProvider } from "./favorites-provider";
import { LocationProvider } from "./location-provider";
import { SessionProvider, type SessionValue } from "./session-provider";
import { UnreadProvider } from "./unread-provider";

export function AppProviders({
  children,
  session,
  favoriteIds,
  unreadTotal,
  savedLocation,
}: {
  children: ReactNode;
  session: SessionValue;
  favoriteIds: string[];
  unreadTotal: number;
  savedLocation: { lat: number; lng: number } | null;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <TooltipProvider delayDuration={200}>
        <SessionProvider value={session}>
          <LocationProvider savedLocation={savedLocation}>
            <FavoritesProvider initialIds={favoriteIds}>
              <UnreadProvider initialTotal={unreadTotal}>
                {children}
                <Toaster position="top-center" richColors closeButton />
              </UnreadProvider>
            </FavoritesProvider>
          </LocationProvider>
        </SessionProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
