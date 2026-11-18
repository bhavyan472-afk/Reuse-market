const CONTROL_SINGLE = /[\u0000-\u001F\u007F]/g;
const CONTROL_MULTI = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

/**
 * Defensive text sanitising for user input. React already escapes output,
 * but we never want stored HTML fragments, control or bidi-spoofing characters.
 */
export function sanitizeText(input: string, { multiline = false }: { multiline?: boolean } = {}): string {
  let s = input.normalize("NFC");
  s = s.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
  s = multiline ? s.replace(CONTROL_MULTI, "") : s.replace(CONTROL_SINGLE, " ");
  s = s.replace(INVISIBLE, "");
  if (multiline) {
    s = s.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  } else {
    s = s.replace(/\s+/g, " ");
  }
  return s.trim();
}

/** Normalise an Indian/international phone number to +<digits>, or null if invalid. */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+") || trimmed.startsWith("00");
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("00")) digits = digits.slice(2);
  if (!hasPlus && digits.length === 10) digits = `91${digits}`;
  if (!hasPlus && digits.length === 11 && digits.startsWith("0")) digits = `91${digits.slice(1)}`;
  const normalized = `+${digits}`;
  return /^\+[0-9]{8,15}$/.test(normalized) ? normalized : null;
}

export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
