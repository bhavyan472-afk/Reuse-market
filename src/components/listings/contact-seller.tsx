"use client";

import { Check, Link2, Loader2, MessageCircle, Phone, Share2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { startConversation } from "@/lib/actions/messages";
import { formatPrice } from "@/lib/format";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.9 1.9 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.3 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.6-8.4z" />
    </svg>
  );
}

export function ContactSeller({
  listingId,
  title,
  price,
  sellerId,
  sellerName,
  phone,
  sold,
  shareUrl,
  tertiary,
}: {
  listingId: string;
  title: string;
  price: number;
  sellerId: string;
  sellerName: string;
  phone: string | null;
  sold: boolean;
  shareUrl: string;
  /** Extra quiet action shown first in the tertiary row (e.g. the Save button). */
  tertiary?: ReactNode;
}) {
  const { userId } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const isOwner = userId === sellerId;

  const waText = `Hi ${sellerName.split(" ")[0]}, I'm interested in your "${title}" (${formatPrice(price)}) on ReUse Market. Is it still available? ${shareUrl}`;
  const digits = phone?.replace(/\D/g, "") ?? "";

  const chat = () => {
    if (!userId) {
      toast.info("Sign in to message the seller.");
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    startTransition(async () => {
      try {
        const res = await startConversation(listingId);
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        router.push(`/messages/${res.data.conversationId}`);
      } catch {
        toast.error("Network error — please try again.");
      }
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Copy it from the address bar instead.");
    }
  };

  const share = async () => {
    const data = { title, text: `${title} — ${formatPrice(price)} on ReUse Market`, url: shareUrl };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(data);
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") toast.error("Sharing failed.");
      }
    } else {
      await copyLink();
    }
  };

  return (
    <div className="space-y-3">
      {!isOwner && (
        <>
          <div className={digits ? "grid grid-cols-2 gap-2.5" : undefined}>
            <Button size="lg" className="w-full px-4" onClick={chat} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <MessageCircle />}
              {sold ? (
                <>
                  Message<span className="sr-only"> seller (sold)</span>
                </>
              ) : (
                <>
                  Chat<span className="sr-only"> with seller</span>
                </>
              )}
            </Button>
            {digits && (
              <Button asChild size="lg" variant="secondary" className="w-full px-4">
                <a href={`https://wa.me/${digits}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-[18px] text-[#128C7E]" /> WhatsApp
                </a>
              </Button>
            )}
          </div>
          {digits ? (
            <Button asChild variant="outline" className="w-full">
              <a href={`tel:+${digits}`}>
                <Phone /> Call seller
              </a>
            </Button>
          ) : !userId ? (
            <p className="text-center text-xs text-muted-foreground">Sign in to see WhatsApp and call options, if the seller shared a number.</p>
          ) : null}
        </>
      )}
      <div className="flex flex-wrap items-center justify-center gap-1 border-t border-border pt-3">
        {tertiary}
        <Button variant="ghost" onClick={share} className="px-3">
          <Share2 /> Share
        </Button>
        <Button variant="ghost" onClick={copyLink} className="px-3" aria-live="polite">
          {copied ? <Check className="text-success" /> : <Link2 />} {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
