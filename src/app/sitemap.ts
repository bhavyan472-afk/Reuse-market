import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { CATEGORIES } from "@/lib/constants";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/marketplace`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    ...CATEGORIES.map((c) => ({
      url: `${base}/marketplace?category=${c.value}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];

  if (!isSupabaseConfigured) return staticRoutes;

  try {
    // Anonymous client: the sitemap only ever contains publicly visible listings.
    const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false } });
    const { data } = await supabase
      .from("listings")
      .select("id, updated_at")
      .eq("status", "available")
      .order("updated_at", { ascending: false })
      .limit(5000);
    return [
      ...staticRoutes,
      ...(data ?? []).map((l) => ({
        url: `${base}/listings/${l.id}`,
        lastModified: new Date(l.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
