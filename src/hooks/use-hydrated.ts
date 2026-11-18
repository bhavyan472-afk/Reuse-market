"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false while React is hydrating server HTML, true afterwards. Use it to keep the first client
 * render identical to the server render for values that only exist in the browser
 * (e.g. geolocation), even inside Suspense boundaries that hydrate late.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
