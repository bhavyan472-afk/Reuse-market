"use client";

import { Flag, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reportListing } from "@/lib/actions/reports";
import { REPORT_REASONS } from "@/lib/constants";
import type { ReportReason } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export function ReportDialog({ listingId, sellerId }: { listingId: string; sellerId: string }) {
  const { userId } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (userId === sellerId) return null;

  const openDialog = () => {
    if (!userId) {
      toast.info("Sign in to report a listing.");
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
  };

  const submit = () => {
    if (!reason) {
      setError("Choose a reason");
      return;
    }
    startTransition(async () => {
      try {
        const res = await reportListing({ listingId, reason, details });
        if (!res.ok) {
          setError(res.fieldErrors?.details ?? res.error);
          return;
        }
        toast.success("Thanks — our team will review this listing.");
        setOpen(false);
        setReason(null);
        setDetails("");
        setError(null);
      } catch {
        setError("Network error — please try again.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <Flag className="size-3.5" /> Report listing
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Report this listing</DialogTitle>
            <DialogDescription>Reports are anonymous. Listings with several reports are hidden automatically.</DialogDescription>
          </DialogHeader>
          <div role="radiogroup" aria-label="Reason" className="grid gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                type="button"
                role="radio"
                aria-checked={reason === r.value}
                key={r.value}
                onClick={() => {
                  setReason(r.value);
                  setError(null);
                }}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                  reason === r.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-details">Details (optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              maxLength={1000}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Anything that helps us review it"
              className="min-h-20"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={pending}>
              {pending && <Loader2 className="animate-spin" />} Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
