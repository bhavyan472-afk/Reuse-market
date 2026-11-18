"use client";

import { format, isSameDay } from "date-fns";
import { ArrowLeft, Check, CheckCheck, Loader2, RotateCw, SendHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useUnread } from "@/components/providers/unread-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { markConversationRead, sendMessage } from "@/lib/actions/messages";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { MessageRow } from "@/lib/supabase/database.types";
import type { ConversationSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type UiMessage = MessageRow & { pending?: boolean; failed?: boolean; tempId?: string };

const CLIENT_BURST = 6; // messages
const CLIENT_WINDOW_MS = 10_000;

export function ChatThread({
  conversation,
  initialMessages,
  userId,
}: {
  conversation: ConversationSummary;
  initialMessages: MessageRow[];
  userId: string;
}) {
  const [messages, setMessages] = useState<UiMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentAt = useRef<number[]>([]);
  const { refresh: refreshUnread } = useUnread();
  const conversationId = conversation.id;

  const markRead = useCallback(async () => {
    await markConversationRead(conversationId).catch(() => undefined);
    void refreshUnread();
  }, [conversationId, refreshUnread]);

  useEffect(() => {
    void markRead();
  }, [markRead]);

  // Realtime: new messages + read receipts for this conversation.
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) return;
      channel = supabase
        .channel(`thread:${conversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            const msg = payload.new as MessageRow;
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
            if (msg.sender_id !== userId) void markRead();
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            const msg = payload.new as MessageRow;
            setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read_at: msg.read_at } : m)));
          },
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") toast.error("Live updates paused — refresh to reconnect.");
        });
    })();
    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [conversationId, userId, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const deliver = async (text: string, tempId: string) => {
    try {
      const res = await sendMessage({ conversationId, body: text });
      if (!res.ok) {
        setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, pending: false, failed: true } : m)));
        toast.error(res.error);
        return;
      }
      setMessages((prev) => {
        const withoutDupe = prev.filter((m) => m.id !== res.data.id);
        return withoutDupe.map((m) => (m.tempId === tempId ? res.data : m));
      });
    } catch {
      setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, pending: false, failed: true } : m)));
      toast.error("Network error — message not sent.");
    }
  };

  const send = async () => {
    const text = body.trim();
    if (!text || sending) return;
    if (text.length > 2000) {
      toast.error("Message is too long (2000 characters max).");
      return;
    }
    const now = Date.now();
    sentAt.current = sentAt.current.filter((t) => now - t < CLIENT_WINDOW_MS);
    if (sentAt.current.length >= CLIENT_BURST) {
      toast.error("Slow down a little — you're sending messages very quickly.");
      return;
    }
    sentAt.current.push(now);

    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: UiMessage = {
      id: tempId,
      tempId,
      conversation_id: conversationId,
      sender_id: userId,
      body: text,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");
    setSending(true);
    await deliver(text, tempId);
    setSending(false);
  };

  const retry = (m: UiMessage) => {
    if (!m.tempId) return;
    setMessages((prev) => prev.map((x) => (x.tempId === m.tempId ? { ...x, pending: true, failed: false } : x)));
    void deliver(m.body, m.tempId);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link href="/messages" className="grid size-9 place-items-center rounded-full hover:bg-muted lg:hidden" aria-label="Back to inbox">
          <ArrowLeft className="size-5" />
        </Link>
        <UserAvatar name={conversation.other.full_name} src={conversation.other.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{conversation.other.full_name || "Member"}</p>
          <p className="text-xs text-muted-foreground">{conversation.role === "seller" ? "Interested in your item" : "Seller"}</p>
        </div>
      </header>

      <Link
        href={`/listings/${conversation.listing.id}`}
        className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-2.5 transition-colors hover:bg-muted"
      >
        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
          {conversation.listing.cover_url && <Image src={conversation.listing.cover_url} alt="" fill sizes="48px" className="object-cover" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{conversation.listing.title}</span>
          <span className="text-sm text-muted-foreground">
            {formatPrice(conversation.listing.price)}
            {conversation.listing.status === "sold" && <span className="ml-2 font-semibold text-gold-text">SOLD</span>}
          </span>
        </span>
        <span className="text-xs text-brand">View</span>
      </Link>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-live="polite" aria-label="Messages">
        {messages.length === 0 && (
          <div className="mx-auto mt-10 max-w-xs text-center text-sm text-muted-foreground">
            <p className="font-serif text-xl text-foreground">Start the conversation</p>
            <p className="mt-2">Ask if it&apos;s still available, check the condition, or suggest a time and place to meet.</p>
          </div>
        )}
        <ol className="space-y-1.5">
          {messages.map((m, i) => {
            const mine = m.sender_id === userId;
            const prev = messages[i - 1];
            const newDay = !prev || !isSameDay(new Date(prev.created_at), new Date(m.created_at));
            return (
              <li key={m.tempId ?? m.id}>
                {newDay && (
                  <p className="my-4 text-center text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase" suppressHydrationWarning>
                    {format(new Date(m.created_at), "EEE, d MMM")}
                  </p>
                )}
                <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                      mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card",
                      m.failed && "bg-destructive/90",
                    )}
                  >
                    <p className="break-words whitespace-pre-wrap">{m.body}</p>
                    <p className={cn("mt-1 flex items-center justify-end gap-1 text-[0.65rem]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      <time dateTime={m.created_at} suppressHydrationWarning>{format(new Date(m.created_at), "h:mm a")}</time>
                      {mine &&
                        (m.pending ? (
                          <Loader2 className="size-3 animate-spin" aria-label="Sending" />
                        ) : m.failed ? (
                          <button type="button" onClick={() => retry(m)} className="inline-flex items-center gap-1 underline">
                            <RotateCw className="size-3" /> Retry
                          </button>
                        ) : m.read_at ? (
                          <CheckCheck className="size-3.5 text-gold" aria-label="Read" />
                        ) : (
                          <Check className="size-3.5" aria-label="Sent" />
                        ))}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Write a message
        </label>
        <textarea
          id="chat-input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Write a message…"
          className="field-sizing-content max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
        <Button type="submit" size="icon" className="size-11" disabled={!body.trim() || sending} aria-label="Send message">
          {sending ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
        </Button>
      </form>
    </div>
  );
}
