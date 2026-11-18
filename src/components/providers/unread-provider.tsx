"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "./session-provider";

type UnreadContextValue = {
  total: number;
  byConversation: Record<string, number>;
  refresh: () => Promise<void>;
};

const UnreadContext = createContext<UnreadContextValue | null>(null);

export function UnreadProvider({ initialTotal, children }: { initialTotal: number; children: ReactNode }) {
  const { userId } = useSession();
  const [byConversation, setByConversation] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(initialTotal);

  const refresh = useCallback(async () => {
    if (!userId) {
      setByConversation({});
      setTotal(0);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_unread_counts");
    if (error || !data) return;
    const map: Record<string, number> = {};
    let sum = 0;
    for (const row of data) {
      map[row.conversation_id] = Number(row.unread);
      sum += Number(row.unread);
    }
    setByConversation(map);
    setTotal(sum);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setByConversation({});
      setTotal(0);
      return;
    }
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) await supabase.realtime.setAuth(data.session.access_token);
      await refresh();
      if (cancelled) return;
      // RLS guarantees we only receive rows from conversations we participate in.
      channel = supabase
        .channel(`unread:${userId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
          void refresh();
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => {
          void refresh();
        })
        .subscribe();
    })();

    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const value = useMemo(() => ({ total, byConversation, refresh }), [total, byConversation, refresh]);
  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>;
}

export function useUnread() {
  const ctx = useContext(UnreadContext);
  if (!ctx) throw new Error("useUnread must be used inside UnreadProvider");
  return ctx;
}
