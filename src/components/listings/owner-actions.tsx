"use client";

import { CheckCircle2, Loader2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteListing, setListingStatus } from "@/lib/actions/listings";
import type { ListingStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export function OwnerActions({
  listingId,
  status,
  title,
  layout = "stack",
  redirectAfterDelete,
}: {
  listingId: string;
  status: ListingStatus;
  title: string;
  layout?: "stack" | "row";
  redirectAfterDelete?: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusPending, startStatus] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const sold = status === "sold";

  const toggleStatus = () =>
    startStatus(async () => {
      try {
        const res = await setListingStatus(listingId, sold ? "available" : "sold");
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success(res.data.status === "sold" ? "Marked as sold — congratulations!" : "Listing is available again");
        router.refresh();
      } catch {
        toast.error("Network error — please try again.");
      }
    });

  const remove = () =>
    startDelete(async () => {
      try {
        const res = await deleteListing(listingId);
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success("Listing deleted");
        setConfirmOpen(false);
        if (redirectAfterDelete) router.push(redirectAfterDelete);
        router.refresh();
      } catch {
        toast.error("Network error — please try again.");
      }
    });

  const size = layout === "row" ? "sm" : "lg";

  return (
    <div className={cn(layout === "stack" ? "grid gap-3" : "flex flex-wrap gap-2")}>
      <Button asChild variant="outline" size={size}>
        <Link href={`/listings/${listingId}/edit`}>
          <Pencil /> Edit
        </Link>
      </Button>
      <Button variant={sold ? "outline" : "secondary"} size={size} onClick={toggleStatus} disabled={statusPending}>
        {statusPending ? <Loader2 className="animate-spin" /> : sold ? <RotateCcw /> : <CheckCircle2 />}
        {sold ? "Mark as available" : "Mark as sold"}
      </Button>
      <Button
        variant="ghost"
        size={size}
        onClick={() => setConfirmOpen(true)}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 /> Delete
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl font-normal">Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              “{title}” and all of its photos will be permanently removed. Conversations about it will also be deleted. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                remove();
              }}
              disabled={deletePending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletePending && <Loader2 className="animate-spin" />} Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
