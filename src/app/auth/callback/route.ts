import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { safeRedirectPath } from "@/lib/sanitize";
import { createClient } from "@/lib/supabase/server";

/** OAuth (Google), email-confirmation and password-recovery links land here with a PKCE `code`. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"), "/");
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");

  if (!isSupabaseConfigured) return NextResponse.redirect(`${origin}/auth/error?reason=config`);
  if (providerError) return NextResponse.redirect(`${origin}/auth/error?reason=provider`);
  if (!code) return NextResponse.redirect(`${origin}/auth/error?reason=missing`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/auth/error?reason=expired`);

  return NextResponse.redirect(`${origin}${next}`);
}
