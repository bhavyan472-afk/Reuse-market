"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/** Counts one view per listing per browser session (the RPC ignores the owner's own views). */
export function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `rm:viewed:${listingId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable — still count the view
    }
    // Supabase query builders are lazy — they only execute once awaited / then()'d.
    createClient()
      .rpc("increment_listing_views", { p_listing_id: listingId })
      .then(({ error }) => {
        if (error) {
          try {
            window.sessionStorage.removeItem(key); // allow a retry on the next visit
          } catch {
            // ignore
          }
        }
      });
  }, [listingId]);
  return null;
}
