import type {
  ListingCategory,
  ListingCondition,
  ListingRow,
  ListingStatus,
  ProfileRow,
} from "@/lib/supabase/database.types";

/** The minimal shape every listing card / map pin needs. */
export type ListingCardData = {
  id: string;
  title: string;
  price: number;
  category: ListingCategory;
  condition: ListingCondition;
  status: ListingStatus;
  city: string;
  lat: number;
  lng: number;
  created_at: string;
  cover_url: string | null;
  distance_km?: number | null;
  /** Optional: price when bought new. Cards show "Save ₹X vs new" only when this is known. */
  original_price?: number | null;
  /** Optional: seller has a verified email. Cards show a tick only when this is known. */
  seller_verified?: boolean | null;
};

export type SellerSummary = Pick<
  ProfileRow,
  "id" | "full_name" | "avatar_url" | "college" | "city" | "created_at" | "email_verified" | "phone" | "bio"
>;

export type ListingDetail = ListingRow & {
  /** Optional: price when bought new (shown as "Save ₹X vs new" when known). */
  original_price?: number | null;
  images: { id: string; url: string; position: number }[];
  seller: SellerSummary;
  sellerActiveCount: number;
};

export type ConversationSummary = {
  id: string;
  listing: { id: string; title: string; price: number; status: ListingStatus; cover_url: string | null };
  other: { id: string; full_name: string; avatar_url: string | null };
  role: "buyer" | "seller";
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
};
