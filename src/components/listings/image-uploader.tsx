"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, GripVertical, ImagePlus, Loader2, RotateCw, Star, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES } from "@/lib/constants";
import { compressAndUpload, removeUploadedFile, validateImageFile } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { ListingImageInput } from "@/lib/validations";

type Item = {
  key: string;
  url: string; // public URL once uploaded, else local preview
  path: string | null;
  status: "uploading" | "done" | "error";
  isNew: boolean;
  progress: number;
  file?: File;
  error?: string;
};

export function ImageUploader({
  userId,
  value,
  onChange,
  onUploadingChange,
  error,
}: {
  userId: string;
  value: ListingImageInput[];
  onChange: (images: ListingImageInput[]) => void;
  onUploadingChange: (uploading: boolean) => void;
  error?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState<Item[]>(() =>
    value.map((v) => ({ key: v.url, url: v.url, path: v.path, status: "done", isNew: false, progress: 100 })),
  );

  // Publish the "done" images (in order) and the uploading flag to the parent form.
  const lastPublished = useRef<string>(JSON.stringify(value));
  useEffect(() => {
    const done = items.filter((i) => i.status === "done").map((i) => ({ url: i.url, path: i.path }));
    const serialized = JSON.stringify(done);
    if (serialized !== lastPublished.current) {
      lastPublished.current = serialized;
      onChange(done);
    }
    onUploadingChange(items.some((i) => i.status === "uploading"));
  }, [items, onChange, onUploadingChange]);

  // Revoke local previews on unmount.
  const itemsRef = useRef(items);
  const removedKeys = useRef(new Set<string>());
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(
    () => () => {
      itemsRef.current.forEach((i) => i.url.startsWith("blob:") && URL.revokeObjectURL(i.url));
    },
    [],
  );

  const upload = useCallback(
    async (key: string, file: File) => {
      try {
        const res = await compressAndUpload(file, userId, "listings", (pct) =>
          setItems((prev) => prev.map((i) => (i.key === key ? { ...i, progress: Math.min(pct, 95) } : i))),
        );
        if (removedKeys.current.has(key)) {
          // removed while uploading — clean up the orphaned file
          void removeUploadedFile(res.path);
          return;
        }
        setItems((prev) =>
          prev.map((i) => {
            if (i.key !== key) return i;
            if (i.url.startsWith("blob:")) URL.revokeObjectURL(i.url);
            return { ...i, url: res.url, path: res.path, status: "done", progress: 100, file: undefined };
          }),
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : "Upload failed.";
        setItems((prev) => prev.map((i) => (i.key === key ? { ...i, status: "error", error: message } : i)));
        toast.error(message);
      }
    },
    [userId],
  );

  const addFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const room = MAX_IMAGES - items.length;
    if (room <= 0) {
      toast.error(`You can add up to ${MAX_IMAGES} photos.`);
      return;
    }
    if (files.length > room) toast.warning(`Only the first ${room} photo${room === 1 ? "" : "s"} will be added (max ${MAX_IMAGES}).`);
    const accepted: Item[] = [];
    for (const file of files.slice(0, room)) {
      const problem = validateImageFile(file);
      if (problem) {
        toast.error(problem);
        continue;
      }
      accepted.push({
        key: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        path: null,
        status: "uploading",
        isNew: true,
        progress: 5,
        file,
      });
    }
    if (!accepted.length) return;
    setItems((prev) => [...prev, ...accepted]);
    accepted.forEach((a) => void upload(a.key, a.file!));
  };

  const remove = (key: string) => {
    const item = items.find((i) => i.key === key);
    removedKeys.current.add(key);
    setItems((prev) => prev.filter((i) => i.key !== key));
    if (!item) return;
    if (item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
    // New uploads that were never saved can be deleted right away; saved images are removed on save.
    if (item.isNew && item.path) void removeUploadedFile(item.path);
  };

  const retry = (key: string) => {
    const item = items.find((i) => i.key === key);
    if (!item?.file) return;
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, status: "uploading", progress: 5, error: undefined } : i)));
    void upload(key, item.file);
  };

  const makeCover = (key: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      return idx > 0 ? arrayMove(prev, idx, 0) : prev;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const from = prev.findIndex((i) => i.key === active.id);
      const to = prev.findIndex((i) => i.key === over.id);
      return from < 0 || to < 0 ? prev : arrayMove(prev, from, to);
    });
  };

  return (
    <div className="space-y-3">
      {items.length < MAX_IMAGES && (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-within:ring-3 focus-within:ring-ring/40",
            dragOver ? "border-primary bg-primary/5" : error ? "border-destructive/60" : "border-border bg-card hover:border-foreground/25",
          )}
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-accent text-gold-text">
            <ImagePlus className="size-5" aria-hidden />
          </span>
          <span className="font-medium">Drag photos here or click to browse</span>
          <span className="text-xs text-muted-foreground">
            JPG, PNG or WebP · up to 5 MB each · {MAX_IMAGES - items.length} of {MAX_IMAGES} slots left
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.key)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Selected photos (drag to reorder)">
              {items.map((item, index) => (
                <SortableThumb
                  key={item.key}
                  item={item}
                  index={index}
                  onRemove={() => remove(item.key)}
                  onRetry={() => retry(item.key)}
                  onMakeCover={() => makeCover(item.key)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      {items.length > 1 && <p className="text-xs text-muted-foreground">Drag to reorder — the first photo is your cover.</p>}
    </div>
  );
}

function SortableThumb({
  item,
  index,
  onRemove,
  onRetry,
  onMakeCover,
}: {
  item: Item;
  index: number;
  onRemove: () => void;
  onRetry: () => void;
  onMakeCover: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted",
        isDragging && "z-10 shadow-lift ring-2 ring-primary",
      )}
    >
      <Image src={item.url} alt={`Photo ${index + 1}`} fill sizes="200px" className="object-cover" unoptimized={item.url.startsWith("blob:")} />

      {index === 0 && (
        <span className="absolute top-2 left-2 rounded-full bg-saffron px-2 py-0.5 text-[10px] font-bold text-saffron-foreground">Cover</span>
      )}

      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder photo ${index + 1}`}
        className="absolute bottom-2 left-2 grid size-8 cursor-grab place-items-center rounded-full bg-card/90 shadow-soft active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="absolute top-2 right-2 flex gap-1.5">
        {index > 0 && item.status === "done" && (
          <button
            type="button"
            onClick={onMakeCover}
            aria-label="Make cover photo"
            title="Make cover photo"
            className="grid size-8 place-items-center rounded-full bg-card/90 shadow-soft opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <Star className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove photo ${index + 1}`}
          className="grid size-8 place-items-center rounded-full bg-card/90 shadow-soft hover:bg-destructive hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>

      {item.status === "uploading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 text-white">
          <Loader2 className="size-6 animate-spin" />
          <div className="h-1 w-2/3 overflow-hidden rounded-full bg-white/30">
            <div className="h-full bg-gold transition-all" style={{ width: `${item.progress}%` }} />
          </div>
          <span className="text-xs">Compressing & uploading…</span>
        </div>
      )}
      {item.status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-destructive/80 p-3 text-center text-xs text-white">
          <AlertCircle className="size-5" />
          <span className="line-clamp-2">{item.error}</span>
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 hover:bg-white/30">
            <RotateCw className="size-3" /> Retry
          </button>
        </div>
      )}
    </li>
  );
}
