"use client";

import { ChevronLeft, ChevronRight, Expand, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SoldRibbon } from "./sold-ribbon";

export function ImageGallery({ images, title, sold }: { images: { id: string; url: string }[]; title: string; sold: boolean }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const count = images.length;

  const go = useCallback(
    (delta: number) => {
      setZoomed(false);
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (count === 0) {
    return <div className="grid aspect-[4/3] place-items-center rounded-card border border-border bg-muted text-muted-foreground">No photos</div>;
  }

  const current = images[index];

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-card border border-border bg-muted shadow-soft">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 z-[5] cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label={`Open photo ${index + 1} of ${count} full screen`}
        />
        <Image
          key={current.id}
          src={current.url}
          alt={`${title} — photo ${index + 1} of ${count}`}
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="animate-in fade-in object-cover duration-500"
        />
        {sold && <SoldRibbon size="lg" />}
        <span className="pointer-events-none absolute right-4 bottom-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium shadow-soft backdrop-blur">
          <Expand className="size-3.5" /> {index + 1} / {count}
        </span>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-soft transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-soft transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="no-scrollbar flex gap-3 overflow-x-auto pb-1" aria-label="Photo thumbnails">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-xl border-2 transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:size-20",
                  i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="96px" priority={i === 0} className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setZoomed(false);
        }}
      >
        <DialogContent className="max-w-[min(96vw,1200px)] gap-0 overflow-hidden border-0 bg-black p-0 sm:max-w-[min(96vw,1200px)] sm:rounded-3xl">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Photo {index + 1} of {count}. Use the arrow keys to navigate and click to zoom.
          </DialogDescription>
          <div
            className={cn("relative h-[80dvh] w-full overflow-hidden", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
            onClick={() => setZoomed((z) => !z)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
            }}
          >
            <Image
              src={current.url}
              alt={`${title} — photo ${index + 1} of ${count}`}
              fill
              sizes="96vw"
              className="object-contain transition-transform duration-300"
              style={{ transform: zoomed ? "scale(2.2)" : "scale(1)", transformOrigin: origin }}
            />
          </div>
          <div className="flex items-center justify-between gap-3 bg-black px-4 py-3 text-white">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={count < 2}
              className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              {zoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
              {zoomed ? "Zoom out" : "Zoom in"} · {index + 1}/{count}
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={count < 2}
              className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
              aria-label="Next photo"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
