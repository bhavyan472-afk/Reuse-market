import { format, formatDistanceToNowStrict } from "date-fns";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  if (value === 0) return "Free";
  return inr.format(value);
}

export function timeAgo(date: string | Date): string {
  const d = new Date(date);
  if (Date.now() - d.getTime() < 60_000) return "just now";
  return `${formatDistanceToNowStrict(d)} ago`;
}

export function formatDate(date: string | Date, pattern = "MMM yyyy"): string {
  return format(new Date(date), pattern);
}

export function formatDistance(km: number | null | undefined): string | null {
  if (km === null || km === undefined || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m away`;
  if (km < 100) return `${km.toFixed(1)} km away`;
  return `${Math.round(km).toLocaleString("en-IN")} km away`;
}

export function initials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function chatTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return format(d, "h:mm a");
  const diffDays = (now.getTime() - d.getTime()) / 86_400_000;
  if (diffDays < 7) return format(d, "EEE");
  return format(d, "d MMM");
}
