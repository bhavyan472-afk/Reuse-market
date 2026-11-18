import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database, ProfileRow } from "./database.types";

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there.
          // The middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/** Current authenticated user (verified with the Supabase Auth server), memoised per request. */
export const getUser = cache(async (): Promise<User | null> => {
  // Reading cookies opts every caller into dynamic rendering, even before Supabase is configured.
  await cookies();
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  } catch {
    return null;
  }
});

/**
 * The signed-in user's OWN full profile, including private fields (phone, saved location).
 * Private columns are not readable through the profiles table (column-level grants), so this
 * goes through the get_my_profile() function, which only ever returns the caller's own row.
 * `userId` must be the current user's id; any other id returns null.
 */
export const getProfile = cache(async (userId: string): Promise<ProfileRow | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_profile").maybeSingle();
  if (error || !data || data.id !== userId) return null;
  return data;
});
