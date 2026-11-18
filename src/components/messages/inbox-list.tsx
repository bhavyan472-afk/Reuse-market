"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSession } from "@/components/providers/session-provider";
import { useUnread } from "@/components/providers/unread-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { chatTime, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { ConversationSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function InboxList({ conversations, activeId }: { conversations: ConversationSummary[]; activeId?: string }) {
  const { byConversation } = useUnread();
  const { userId } = useSession();
  const router = useRouter();
  const timer = useRef<number | null>(null);

  // Re-sort / refresh previews whenever a new message arrives in any of my conversations.
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) return;
      channel = supabase
        .channel(`inbox:${userId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
          if (timer.current) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => router.refresh(), 400);
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => router.refresh())
        .subscribe();
    })();
    return () => {
      cancelled = true;
      if (timer.current) window.clearTimeout(timer.current);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return (
    <ul className="divide-y divide-border" aria-label="Conversations">
      {conversations.map((c) => {
        const unread = byConversation[c.id] ?? 0;
        const active = c.id === activeId;
        return (
          <li key={c.id}>
            <Link
              href={`/messages/${c.id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex gap-3 px-4 py-4 transition-colors outline-none focus-visible:bg-muted",
                active ? "bg-accent/60" : "hover:bg-muted/60",
              )}
            >
              <div className="relative shrink-0">
                <div className="relative size-14 overflow-hidden rounded-2xl bg-muted">
                  {c.listing.cover_url && <Image src={c.listing.cover_url} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <UserAvatar name={c.other.full_name} src={c.other.avatar_url} className="absolute -right-1.5 -bottom-1.5 size-7 ring-2 ring-card" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate text-sm", unread ? "font-semibold" : "font-medium")}>{c.other.full_name || "Member"}</p>
                  {c.last_message_at && (
                    <time className="shrink-0 text-[0.7rem] text-muted-foreground" dateTime={c.last_message_at} suppressHydrationWarning>
                      {chatTime(c.last_message_at)}
                    </time>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="text-gold-text">{c.role === "seller" ? "Selling" : "Buying"}</span> · {c.listing.title} ·{" "}
                  {formatPrice(c.listing.price)}
                  {c.listing.status === "sold" && " · Sold"}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className={cn("truncate text-sm", unread ? "text-foreground" : "text-muted-foreground")}>
                    {c.last_message_preview ?? "No messages yet — say hello"}
                  </p>
                  {unread > 0 && (
                    <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-gold px-1.5 text-[10px] leading-5 font-semibold text-ink">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
