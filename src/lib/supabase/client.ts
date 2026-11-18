import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | undefined;

export function createClient(): SupabaseClient<Database> {
  if (!client) {
    client = createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
  }
  return client;
}
