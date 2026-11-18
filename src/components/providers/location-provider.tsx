"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentPosition, isValidLatLng, type LatLng } from "@/lib/geo";

type LocationSource = "device" | "profile";

type LocationContextValue = {
  /** Best known location of the viewer (device GPS, else saved profile location). */
  location: LatLng | null;
  source: LocationSource | null;
  locating: boolean;
  error: string | null;
  requestLocation: () => Promise<LatLng | null>;
};

const STORAGE_KEY = "rm:device-location";
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

const LocationContext = createContext<LocationContextValue | null>(null);

function readStored(): LatLng | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { lat, lng, at } = parsed as { lat?: unknown; lng?: unknown; at?: unknown };
    if (!isValidLatLng(lat, lng) || typeof at !== "number" || Date.now() - at > MAX_AGE_MS) return null;
    return { lat: lat as number, lng: lng as number };
  } catch {
    return null;
  }
}

export function LocationProvider({
  savedLocation,
  children,
}: {
  savedLocation: LatLng | null;
  children: ReactNode;
}) {
  const [device, setDevice] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setDevice(stored);
      return;
    }
    // If the visitor has already granted location access, refresh it silently (never prompts).
    let cancelled = false;
    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((status) => {
          if (cancelled || status.state !== "granted") return;
          return getCurrentPosition().then((pos) => {
            if (cancelled) return;
            setDevice(pos);
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...pos, at: Date.now() }));
            } catch {
              // storage unavailable
            }
          });
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const requestLocation = useCallback(async () => {
    setLocating(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      setDevice(pos);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...pos, at: Date.now() }));
      } catch {
        // storage unavailable (private mode) — keep the in-memory value
      }
      return pos;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not get your location.");
      return null;
    } finally {
      setLocating(false);
    }
  }, []);

  const value = useMemo<LocationContextValue>(() => {
    const location = device ?? savedLocation;
    return {
      location,
      source: device ? "device" : savedLocation ? "profile" : null,
      locating,
      error,
      requestLocation,
    };
  }, [device, savedLocation, locating, error, requestLocation]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useViewerLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useViewerLocation must be used inside LocationProvider");
  return ctx;
}
