"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { toggleFavorite } from "@/lib/actions/favorites";
import { useSession } from "./session-provider";

type FavoritesContextValue = {
  isSaved: (listingId: string) => boolean;
  toggle: (listingId: string) => Promise<void>;
  pending: (listingId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ initialIds, children }: { initialIds: string[]; children: ReactNode }) {
  const { userId } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [ids, setIds] = useState(() => new Set(initialIds));
  const [pendingIds, setPendingIds] = useState(() => new Set<string>());
  const [lastUser, setLastUser] = useState(userId);

  // Reset when the signed-in user changes (login / logout).
  if (lastUser !== userId) {
    setLastUser(userId);
    setIds(new Set(initialIds));
  }

  const toggle = useCallback(
    async (listingId: string) => {
      if (!userId) {
        toast.info("Sign in to save items to your wishlist.");
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const wasSaved = ids.has(listingId);
      const apply = (saved: boolean) =>
        setIds((prev) => {
          const next = new Set(prev);
          if (saved) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
      apply(!wasSaved);
      setPendingIds((p) => new Set(p).add(listingId));
      try {
        const res = await toggleFavorite(listingId);
        if (!res.ok) {
          apply(wasSaved);
          toast.error(res.error);
          return;
        }
        apply(res.data.saved);
        toast.success(res.data.saved ? "Saved to your wishlist" : "Removed from your wishlist");
        router.refresh();
      } catch {
        apply(wasSaved);
        toast.error("Network error — please check your connection and try again.");
      } finally {
        setPendingIds((p) => {
          const next = new Set(p);
          next.delete(listingId);
          return next;
        });
      }
    },
    [ids, userId, router, pathname],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      isSaved: (id) => ids.has(id),
      pending: (id) => pendingIds.has(id),
      toggle,
    }),
    [ids, pendingIds, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
