"use server";

import { revalidatePath } from "next/cache";
import { sanitizeText } from "@/lib/sanitize";
import { createClient, getUser } from "@/lib/supabase/server";
import type { MessageRow } from "@/lib/supabase/database.types";
import { messageSchema, uuidSchema } from "@/lib/validations";
import { failure, friendlyDbError, fromZodError, success, type ActionResult } from "./result";

export async function startConversation(listingId: string): Promise<ActionResult<{ conversationId: string }>> {
  const user = await getUser();
  if (!user) return failure("Please sign in to message the seller.");
  if (!uuidSchema.safeParse(listingId).success) return failure("Listing not found.");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_conversation", { p_listing_id: listingId });
  if (error || !data) return failure(friendlyDbError(error, "Could not start the conversation."));
  revalidatePath("/messages");
  return success({ conversationId: data });
}

export async function sendMessage(input: { conversationId: string; body: string }): Promise<ActionResult<MessageRow>> {
  const user = await getUser();
  if (!user) return failure("Please sign in to send messages.");

  const body = sanitizeText(input.body ?? "", { multiline: true });
  const parsed = messageSchema.safeParse({ conversationId: input.conversationId, body });
  if (!parsed.success) return fromZodError(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: parsed.data.conversationId, sender_id: user.id, body: parsed.data.body })
    .select("*")
    .single();
  if (error || !data) return failure(friendlyDbError(error, "Message not sent. Please try again."));
  return success(data);
}

export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return failure("Please sign in.");
  if (!uuidSchema.safeParse(conversationId).success) return failure("Conversation not found.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId });
  if (error) return failure(friendlyDbError(error, "Could not update read status."));
  return success(undefined);
}
