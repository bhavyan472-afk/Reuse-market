"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { LocationPicker } from "@/components/maps/location-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createListing, updateListing } from "@/lib/actions/listings";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { listingSchema, type ListingFormValues, type ListingImageInput, type ListingInput } from "@/lib/validations";
import { ImageUploader } from "./image-uploader";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError id={`${htmlFor}-error`} message={error} />
    </div>
  );
}

export function ListingForm({
  userId,
  mode,
  listingId,
  defaultValues,
}: {
  userId: string;
  mode: "create" | "edit";
  listingId?: string;
  defaultValues?: Partial<ListingFormValues>;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues, unknown, ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: defaultValues ?? {
      title: "",
      description: "",
      price: Number.NaN,
      images: [],
      location: null,
    },
    mode: "onTouched",
  });

  const description = watch("description") ?? "";

  const onImagesChange = useCallback(
    (imgs: ListingImageInput[]) => setValue("images", imgs, { shouldValidate: imgs.length > 0, shouldDirty: true }),
    [setValue],
  );

  const onSubmit = async (values: ListingInput) => {
    setFormError(null);
    if (uploading) {
      setFormError("Please wait for your photos to finish uploading.");
      return;
    }
    try {
      const res = mode === "create" ? await createListing(values) : await updateListing(listingId!, values);
      if (!res.ok) {
        setFormError(res.error);
        Object.entries(res.fieldErrors ?? {}).forEach(([key, message]) => {
          const name = (key.startsWith("location") ? "location" : key.split(".")[0]) as FieldPath<ListingFormValues>;
          setError(name, { message });
        });
        toast.error(res.error);
        return;
      }
      toast.success(mode === "create" ? "Your listing is live!" : "Changes saved");
      router.push(`/listings/${res.data.id}`);
      router.refresh();
    } catch {
      const msg = "Network error — your listing wasn't saved. Check your connection and try again.";
      setFormError(msg);
      toast.error(msg);
    }
  };

  const locationError = errors.location?.message ?? errors.location?.address?.message ?? errors.location?.city?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
      <section className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold">Photos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Bright, honest photos sell faster. Add up to six.</p>
        </div>
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageUploader
              userId={userId}
              value={field.value ?? []}
              onChange={onImagesChange}
              onUploadingChange={setUploading}
              error={errors.images?.message}
            />
          )}
        />
        <FieldError id="images-error" message={errors.images?.message} />
      </section>

      <section className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">Details</h2>
        <Field label="Title" htmlFor="title" error={errors.title?.message} hint="e.g. “Casio fx-991EX scientific calculator”">
          <Input
            id="title"
            maxLength={100}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
            {...register("title")}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Category" htmlFor="category" error={errors.category?.message}>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category" className="w-full" aria-invalid={!!errors.category} onBlur={field.onBlur}>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <c.icon className="size-4 text-brand" /> {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Price" htmlFor="price" error={errors.price?.message} hint="Whole rupees. Enter 0 to give it away free.">
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₹</span>
              <Input
                id="price"
                type="number"
                inputMode="numeric"
                min={0}
                max={10000000}
                step={1}
                className="pl-8"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? "price-error" : undefined}
                {...register("price", { valueAsNumber: true })}
              />
            </div>
          </Field>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Condition</legend>
          <Controller
            control={control}
            name="condition"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Condition" className="grid gap-3 sm:grid-cols-4">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={field.value === c.value}
                    onClick={() => field.onChange(c.value)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                      field.value === c.value
                        ? "border-primary bg-sage-soft/60"
                        : errors.condition
                          ? "border-destructive/60"
                          : "border-border hover:border-foreground/25",
                    )}
                  >
                    <span className="block font-medium">{c.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{c.hint}</span>
                  </button>
                ))}
              </div>
            )}
          />
          <FieldError id="condition-error" message={errors.condition?.message} />
        </fieldset>

        <Field label="Description" htmlFor="description" error={errors.description?.message}>
          <Textarea
            id="description"
            rows={6}
            maxLength={3000}
            placeholder="Age, usage, what's included, any flaws, why you're selling…"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "description-error" : undefined}
            {...register("description")}
          />
          <p className="text-right text-xs text-muted-foreground">{description.length} / 3000</p>
        </Field>
      </section>

      <section className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold">Meeting point</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Buyers see this pin and can get directions. Choose a public spot you&apos;re comfortable with.
          </p>
        </div>
        <Controller
          control={control}
          name="location"
          render={({ field }) => (
            <LocationPicker id="location" value={field.value ?? null} onChange={(v) => field.onChange(v)} error={locationError} />
          )}
        />
        <FieldError id="location-error" message={locationError} />
      </section>

      {formError && (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {formError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting || uploading} className="min-w-48">
          {(isSubmitting || uploading) && <Loader2 className="animate-spin" />}
          {uploading ? "Uploading photos…" : mode === "create" ? "Publish listing" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
