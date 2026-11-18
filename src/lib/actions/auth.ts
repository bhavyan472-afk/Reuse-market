"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { env, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/sanitize";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/lib/validations";
import { failure, fromZodError, success, type ActionResult } from "./result";

const NOT_CONFIGURED = "Supabase is not configured. Add your keys to .env.local (see README).";

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin && /^https?:\/\//.test(origin)) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : env.siteUrl;
}

function authMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Incorrect email or password.";
  if (/email not confirmed/i.test(message)) return "Please confirm your email first — check your inbox for the link.";
  if (/rate limit|too many/i.test(message)) return "Too many attempts. Please wait a minute and try again.";
  if (/user already registered/i.test(message)) return "An account with this email already exists. Try signing in.";
  if (/password should be|weak password/i.test(message)) return "Please choose a stronger password.";
  if (/same.*password|different from the old/i.test(message)) return "Your new password must be different from the old one.";
  if (/fetch failed|network/i.test(message)) return "Couldn't reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

export async function signIn(input: LoginInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) return failure(NOT_CONFIGURED);
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return failure(authMessage(error.message));
  revalidatePath("/", "layout");
  return success(undefined);
}

export async function signUp(input: RegisterInput): Promise<ActionResult<{ needsConfirmation: boolean }>> {
  if (!isSupabaseConfigured) return failure(NOT_CONFIGURED);
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: sanitizeText(parsed.data.fullName) },
      emailRedirectTo: `${origin}/auth/callback?next=/`,
    },
  });
  if (error) return failure(authMessage(error.message));

  // With email confirmation on, Supabase returns a user with no identities when the email is taken.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return failure("An account with this email already exists. Try signing in.", {
      email: "This email is already registered",
    });
  }

  revalidatePath("/", "layout");
  return success({ needsConfirmation: !data.session });
}

export async function signOut(): Promise<ActionResult> {
  if (!isSupabaseConfigured) return failure(NOT_CONFIGURED);
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return failure(authMessage(error.message));
  revalidatePath("/", "layout");
  return success(undefined);
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) return failure(NOT_CONFIGURED);
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  // Don't reveal whether the email exists; only surface rate-limit / network problems.
  if (error && /rate limit|too many|fetch failed|network/i.test(error.message)) {
    return failure(authMessage(error.message));
  }
  return success(undefined);
}

export async function updatePassword(input: ResetPasswordInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) return failure(NOT_CONFIGURED);
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return failure("Your reset link has expired. Please request a new one.");
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return failure(authMessage(error.message));
  revalidatePath("/", "layout");
  return success(undefined);
}
