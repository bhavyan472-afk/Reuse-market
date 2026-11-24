import {
  Armchair,
  BookOpen,
  Bike,
  Calculator,
  Cpu,
  Laptop,
  Package,
  Shirt,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import type { ListingCategory, ListingCondition, ReportReason } from "@/lib/supabase/database.types";

export const SITE_NAME = "ReUse Market";
export const SITE_TAGLINE = "Give Products a Second Life.";
export const SITE_DESCRIPTION =
  "A curated second-hand marketplace for students and local communities. Buy and sell books, laptops, bicycles, furniture and more — near you.";

export const CATEGORIES: { value: ListingCategory; label: string; icon: LucideIcon }[] = [
  { value: "books", label: "Books", icon: BookOpen },
  { value: "laptops", label: "Laptops", icon: Laptop },
  { value: "mobiles", label: "Mobiles", icon: Smartphone },
  { value: "bicycles", label: "Bicycles", icon: Bike },
  { value: "calculators", label: "Calculators", icon: Calculator },
  { value: "furniture", label: "Furniture", icon: Armchair },
  { value: "electronics", label: "Electronics", icon: Cpu },
  { value: "clothing", label: "Clothing", icon: Shirt },
  { value: "others", label: "Others", icon: Package },
];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as [ListingCategory, ...ListingCategory[]];

export const CONDITIONS: { value: ListingCondition; label: string; hint: string }[] = [
  { value: "new", label: "New", hint: "Unused, in original packaging" },
  { value: "like_new", label: "Like New", hint: "Used briefly, no visible wear" },
  { value: "good", label: "Good", hint: "Normal signs of use, fully working" },
  { value: "fair", label: "Fair", hint: "Visible wear, works as described" },
];

export const CONDITION_VALUES = CONDITIONS.map((c) => c.value) as [ListingCondition, ...ListingCondition[]];

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or duplicate" },
  { value: "scam", label: "Looks like a scam" },
  { value: "prohibited", label: "Prohibited item" },
  { value: "wrong_category", label: "Wrong category" },
  { value: "offensive", label: "Offensive content" },
  { value: "other", label: "Something else" },
];

export const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: low to high" },
  { value: "newest", label: "Newest first" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "nearest", label: "Nearest" },
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
/** Budget-first: the marketplace sorts by price (low → high) unless the shopper picks otherwise. */
export const DEFAULT_SORT: SortOption = "price_asc";

/** Budget bands shown as quick price chips (homepage + marketplace filters). */
export const BUDGETS: { label: string; min: number | null; max: number | null }[] = [
  { label: "Under ₹500", min: null, max: 500 },
  { label: "₹500–2,000", min: 500, max: 2000 },
  { label: "₹2,000–8,000", min: 2000, max: 8000 },
  { label: "₹8,000–20,000", min: 8000, max: 20000 },
  { label: "₹20,000+", min: 20000, max: null },
];

export const DISTANCE_OPTIONS = [5, 10, 25, 50] as const;

export const PRICE_MAX = 100000;
export const PAGE_SIZE = 12;
export const MAP_PAGE_SIZE = 200;
export const MAX_IMAGES = 6;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Map centre when we know nothing about the user (centre of India). */
export const DEFAULT_CENTER = { lat: 22.9734, lng: 78.6569 };

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? "Others";
}

export function conditionLabel(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}
