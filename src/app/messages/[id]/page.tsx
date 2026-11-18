import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ChatThread } from "@/components/messages/chat-thread";
import { InboxList } from "@/components/messages/inbox-list";
import { getConversation, getConversations, getMessages } from "@/lib/queries";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Conversation", robots: { index: false } };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect(`/login?next=/messages/${id}`);

  // RLS guarantees only the two participants can load the conversation or its messages.
  const [conversation, conversations, messages] = await Promise.all([
    getConversation(id, user.id),
    getConversations(user.id),
    getMessages(id),
  ]);
  if (!conversation) notFound();

  return (
    <div className="container-page py-4 sm:py-10">
      <div className="grid h-[calc(100dvh-10rem)] min-h-[480px] overflow-hidden rounded-3xl border border-border bg-card md:h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-12rem)] lg:grid-cols-[380px_1fr]">
        <div className="hidden overflow-y-auto border-r border-border lg:block">
          <InboxList conversations={conversations} activeId={id} />
        </div>
        <ChatThread key={id} conversation={conversation} initialMessages={messages} userId={user.id} />
      </div>
    </div>
  );
}
