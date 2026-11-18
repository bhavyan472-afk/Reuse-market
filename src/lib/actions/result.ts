import type { ZodError } from "zod";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function success<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function failure(error: string, fieldErrors?: Record<string, string>): { ok: false; error: string; fieldErrors?: Record<string, string> } {
  return { ok: false, error, fieldErrors };
}

export function fromZodError(err: ZodError): { ok: false; error: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
}

/** Turn a Postgres / PostgREST error into a message that is safe and useful to show users. */
export function friendlyDbError(error: { message?: string; code?: string } | null | undefined, fallback: string): string {
  const message = error?.message ?? "";
  const tagged = message.match(/^(RATE_LIMITED|IMAGE_LIMIT|AUTH_REQUIRED|NOT_FOUND|OWN_LISTING):\s*(.+)$/);
  if (tagged) return tagged[2];
  if (error?.code === "23505") return "That already exists.";
  if (error?.code === "42501" || /row-level security|permission denied/i.test(message)) {
    return "You don't have permission to do that.";
  }
  if (/fetch failed|network|ECONN|ETIMEDOUT/i.test(message)) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return fallback;
}
