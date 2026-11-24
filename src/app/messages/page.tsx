import { MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InboxList } from "@/components/messages/inbox-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getConversations } from "@/lib/queries";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Messages", robots: { index: false } };

export default async function MessagesPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/messages");
  const conversations = await getConversations(user.id);

  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader eyebrow="Inbox" title="Messages" description="Conversations are grouped by the item they're about." />
      {conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="When you message a seller — or a buyer messages you — it'll show up here in real time."
          action={{ label: "Find something you like", href: "/marketplace" }}
        />
      ) : (
        <div className="grid overflow-hidden rounded-3xl border border-border bg-card lg:h-[calc(100dvh-16rem)] lg:min-h-[520px] lg:grid-cols-[380px_1fr]">
          <div className="overflow-y-auto lg:border-r lg:border-border">
            <InboxList conversations={conversations} />
          </div>
          <div className="hidden flex-col items-center justify-center gap-3 p-10 text-center text-muted-foreground lg:flex">
            <MessagesSquare className="size-10 text-gold" aria-hidden />
            <p className="text-xl font-bold text-foreground">Select a conversation</p>
            <p className="max-w-xs text-sm">Pick a chat on the left to read and reply. New messages arrive instantly.</p>
          </div>
        </div>
      )}
    </div>
  );
}
