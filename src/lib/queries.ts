import "server-only";
import { cache } from "react";
import { createClient, getUser } from "@/lib/supabase/server";
import type { ListingCategory, SearchListingRow } from "@/lib/supabase/database.types";
import type { MarketFilters } from "@/lib/search-params";
import type { ConversationSummary, ListingCardData, ListingDetail } from "@/lib/types";

export class DataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataError";
  }
}

function toCard(row: SearchListingRow): ListingCardData {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    category: row.category,
    condition: row.condition,
    status: row.status,
    city: row.city,
    lat: row.lat,
    lng: row.lng,
    created_at: row.created_at,
    cover_url: row.cover_url,
    distance_km: row.distance_km,
  };
}

export async function searchListings(
  filters: Partial<MarketFilters> & { excludeId?: string; sellerId?: string },
  { limit, offset }: { limit: number; offset: number },
): Promise<{ items: ListingCardData[]; total: number }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_listings", {
    p_query: filters.q || null,
    p_category: filters.category ?? null,
    p_min_price: filters.minPrice ?? null,
    p_max_price: filters.maxPrice ?? null,
    p_conditions: filters.conditions?.length ? filters.conditions : null,
    p_include_sold: filters.availableOnly === false,
    p_lat: filters.lat ?? null,
    p_lng: filters.lng ?? null,
    p_radius_km: filters.radius ?? null,
    p_sort: filters.sort ?? "newest",
    p_limit: limit,
    p_offset: offset,
    p_exclude_id: filters.excludeId ?? null,
    p_seller_id: filters.sellerId ?? null,
  });
  if (error) throw new DataError(`Could not load listings: ${error.message}`);
  const rows = data ?? [];
  return { items: rows.map(toCard), total: rows.length ? Number(rows[0].total_count) : 0 };
}

export async function getRecentListings(limit = 8) {
  return (await searchListings({ sort: "newest" }, { limit, offset: 0 })).items;
}

export async function getSimilarListings(id: string, category: ListingCategory, limit = 4) {
  return (await searchListings({ category, excludeId: id, sort: "newest" }, { limit, offset: 0 })).items;
}

export const getListing = cache(async (id: string): Promise<ListingDetail | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      // Only public profile columns can be embedded; the phone comes from get_listing_contact() below.
      "*, listing_images(id, url, position), seller:profiles!listings_seller_id_fkey(id, full_name, avatar_url, college, city, created_at, email_verified, bio)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new DataError(`Could not load listing: ${error.message}`);
  if (!data || !data.seller) return null;

  // Seller phone is private: only signed-in users can get it, and only for a visible listing
  // (shown as Call/WhatsApp). Logged-out visitors skip the request entirely.
  const loadPhone = async (): Promise<string | null> => {
    if (!(await getUser())) return null;
    const { data: phone, error: phoneError } = await supabase.rpc("get_listing_contact", { p_listing_id: id });
    return phoneError ? null : (phone ?? null);
  };

  const [{ count }, phone] = await Promise.all([
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", data.seller_id)
      .eq("status", "available"),
    loadPhone(),
  ]);

  const { listing_images, seller, ...rest } = data;
  return {
    ...rest,
    images: [...listing_images].sort((a, b) => a.position - b.position),
    seller: { ...seller, phone },
    sellerActiveCount: count ?? 0,
  };
});

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", userId);
  return (data ?? []).map((f) => f.listing_id);
}

export async function getUnreadTotal(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_unread_counts");
  return (data ?? []).reduce((sum, r) => sum + Number(r.unread), 0);
}

export async function getSavedListings(userId: string): Promise<ListingCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select(
      "created_at, listing:listings(id, title, price, category, condition, status, city, lat, lng, created_at, listing_images(url, position))",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new DataError(`Could not load saved items: ${error.message}`);
  return (data ?? [])
    .map((f) => f.listing)
    .filter((l): l is NonNullable<typeof l> => !!l)
    .map((l) => {
      const { listing_images, ...rest } = l;
      const cover = [...listing_images].sort((a, b) => a.position - b.position)[0];
      return { ...rest, cover_url: cover?.url ?? null };
    });
}

export type MyListing = ListingCardData & { views: number; favorites_count: number; is_hidden: boolean; updated_at: string };

export async function getMyListings(userId: string): Promise<MyListing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, price, category, condition, status, city, lat, lng, created_at, updated_at, views, favorites_count, is_hidden, listing_images(url, position)",
    )
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new DataError(`Could not load your listings: ${error.message}`);
  return (data ?? []).map((l) => {
    const { listing_images, ...rest } = l;
    const cover = [...listing_images].sort((a, b) => a.position - b.position)[0];
    return { ...rest, cover_url: cover?.url ?? null };
  });
}

const CONVERSATION_SELECT =
  "id, buyer_id, seller_id, last_message_at, last_message_preview, created_at, listing:listings(id, title, price, status, listing_images(url, position)), buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url), seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url)";

type RawConversation = {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  listing: {
    id: string;
    title: string;
    price: number;
    status: "available" | "sold";
    listing_images: { url: string; position: number }[];
  } | null;
  buyer: { id: string; full_name: string; avatar_url: string | null } | null;
  seller: { id: string; full_name: string; avatar_url: string | null } | null;
};

function toConversationSummary(c: RawConversation, userId: string): ConversationSummary | null {
  if (!c.listing || !c.buyer || !c.seller) return null;
  const role = c.buyer_id === userId ? "buyer" : "seller";
  const cover = [...c.listing.listing_images].sort((a, b) => a.position - b.position)[0];
  return {
    id: c.id,
    role,
    other: role === "buyer" ? c.seller : c.buyer,
    listing: {
      id: c.listing.id,
      title: c.listing.title,
      price: c.listing.price,
      status: c.listing.status,
      cover_url: cover?.url ?? null,
    },
    last_message_at: c.last_message_at,
    last_message_preview: c.last_message_preview,
    created_at: c.created_at,
  };
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new DataError(`Could not load conversations: ${error.message}`);
  return ((data ?? []) as RawConversation[])
    .map((c) => toConversationSummary(c, userId))
    .filter((c): c is ConversationSummary => !!c);
}

export async function getConversation(id: string, userId: string): Promise<ConversationSummary | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("conversations").select(CONVERSATION_SELECT).eq("id", id).maybeSingle();
  if (error) throw new DataError(`Could not load conversation: ${error.message}`);
  if (!data) return null;
  return toConversationSummary(data as RawConversation, userId);
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw new DataError(`Could not load messages: ${error.message}`);
  return data ?? [];
}

export async function getPublicProfile(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, college, city, bio, created_at, email_verified")
    .eq("id", id)
    .maybeSingle();
  return data;
}
