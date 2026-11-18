import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { safeRedirectPath } from "@/lib/sanitize";
import { createClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/**
 * Token-hash links (work across devices). Use these in Supabase email templates, e.g.
 * {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/
 * {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get("next"), type === "recovery" ? "/reset-password" : "/");

  if (!isSupabaseConfigured) return NextResponse.redirect(`${origin}/auth/error?reason=config`);
  if (!tokenHash || !type || !TYPES.includes(type)) return NextResponse.redirect(`${origin}/auth/error?reason=missing`);

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(`${origin}/auth/error?reason=expired`);

  return NextResponse.redirect(`${origin}${next}`);
}
