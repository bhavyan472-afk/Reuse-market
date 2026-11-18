// Hand-maintained types matching supabase/migrations/20261117000000_init.sql.
// Regenerate with `npx supabase gen types typescript --project-id <id>` if you change the schema.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ListingStatus = "available" | "sold";
export type ListingCondition = "new" | "like_new" | "good" | "fair";
export type ListingCategory =
  | "books"
  | "laptops"
  | "mobiles"
  | "bicycles"
  | "calculators"
  | "furniture"
  | "electronics"
  | "clothing"
  | "others";
export type ReportReason = "spam" | "scam" | "prohibited" | "wrong_category" | "offensive" | "other";

type Timestamps = { created_at: string; updated_at: string };

export type ProfileRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  college: string | null;
  bio: string | null;
  location_address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  email_verified: boolean;
} & Timestamps;

export type ListingRow = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: ListingCategory;
  price: number;
  condition: ListingCondition;
  status: ListingStatus;
  address: string;
  city: string;
  lat: number;
  lng: number;
  views: number;
  favorites_count: number;
  reports_count: number;
  is_hidden: boolean;
  sold_at: string | null;
  search: unknown;
} & Timestamps;

export type ListingImageRow = {
  id: string;
  listing_id: string;
  url: string;
  storage_path: string | null;
  position: number;
} & Timestamps;

export type FavoriteRow = { id: string; user_id: string; listing_id: string } & Timestamps;

export type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
} & Timestamps;

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
} & Timestamps;

export type ReportRow = {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: ReportReason;
  details: string | null;
} & Timestamps;

export type SearchListingRow = {
  id: string;
  seller_id: string;
  title: string;
  category: ListingCategory;
  price: number;
  condition: ListingCondition;
  status: ListingStatus;
  address: string;
  city: string;
  lat: number;
  lng: number;
  views: number;
  created_at: string;
  cover_url: string | null;
  distance_km: number | null;
  total_count: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          college?: string | null;
          bio?: string | null;
          location_address?: string | null;
          city?: string | null;
          lat?: number | null;
          lng?: number | null;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          college?: string | null;
          bio?: string | null;
          location_address?: string | null;
          city?: string | null;
          lat?: number | null;
          lng?: number | null;
        };
        Relationships: [];
      };
      listings: {
        Row: ListingRow;
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          description: string;
          category: ListingCategory;
          price: number;
          condition: ListingCondition;
          status?: ListingStatus;
          address: string;
          city: string;
          lat: number;
          lng: number;
        };
        Update: {
          title?: string;
          description?: string;
          category?: ListingCategory;
          price?: number;
          condition?: ListingCondition;
          status?: ListingStatus;
          address?: string;
          city?: string;
          lat?: number;
          lng?: number;
        };
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_images: {
        Row: ListingImageRow;
        Insert: {
          id?: string;
          listing_id: string;
          url: string;
          storage_path?: string | null;
          position?: number;
        };
        Update: {
          url?: string;
          storage_path?: string | null;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: FavoriteRow;
        Insert: { id?: string; user_id: string; listing_id: string };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: ConversationRow;
        Insert: { id?: string; listing_id: string; buyer_id: string; seller_id: string };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: MessageRow;
        Insert: { id?: string; conversation_id: string; sender_id: string; body: string };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: ReportRow;
        Insert: {
          id?: string;
          listing_id: string;
          reporter_id: string;
          reason: ReportReason;
          details?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "reports_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      search_listings: {
        Args: {
          p_query?: string | null;
          p_category?: ListingCategory | null;
          p_min_price?: number | null;
          p_max_price?: number | null;
          p_conditions?: ListingCondition[] | null;
          p_include_sold?: boolean;
          p_lat?: number | null;
          p_lng?: number | null;
          p_radius_km?: number | null;
          p_sort?: string;
          p_limit?: number;
          p_offset?: number;
          p_exclude_id?: string | null;
          p_seller_id?: string | null;
        };
        Returns: SearchListingRow[];
      };
      increment_listing_views: { Args: { p_listing_id: string }; Returns: undefined };
      /** The signed-in user's own full profile row (incl. private phone/location). */
      get_my_profile: { Args: Record<string, never>; Returns: ProfileRow[] };
      /** Seller phone for one visible listing (null if none / hidden / unknown). */
      get_listing_contact: { Args: { p_listing_id: string }; Returns: string | null };
      start_conversation: { Args: { p_listing_id: string }; Returns: string };
      mark_conversation_read: { Args: { p_conversation_id: string }; Returns: undefined };
      get_unread_counts: {
        Args: Record<string, never>;
        Returns: { conversation_id: string; unread: number }[];
      };
      haversine_km: {
        Args: { lat1: number; lng1: number; lat2: number; lng2: number };
        Returns: number;
      };
    };
    Enums: {
      listing_status: ListingStatus;
      listing_condition: ListingCondition;
      listing_category: ListingCategory;
      report_reason: ReportReason;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
