"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/auth/auth-shell";
import { LocationPicker } from "@/components/maps/location-picker";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/lib/actions/profile";
import { compressAndUpload, removeUploadedFile, validateImageFile } from "@/lib/upload";
import { profileSchema, type ProfileInput } from "@/lib/validations";

export function ProfileForm({ userId, defaultValues }: { userId: string; defaultValues: ProfileInput }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [freshUpload, setFreshUpload] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues });

  const avatarUrl = watch("avatarUrl");
  const fullName = watch("fullName");
  const bio = watch("bio") ?? "";

  const onAvatar = async (file: File) => {
    const problem = validateImageFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    setAvatarUploading(true);
    try {
      const { url, path } = await compressAndUpload(file, userId, "avatars");
      if (freshUpload) void removeUploadedFile(freshUpload);
      setFreshUpload(path);
      setValue("avatarUrl", url, { shouldDirty: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Avatar upload failed.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSubmit = async (values: ProfileInput) => {
    setFormError(null);
    try {
      const res = await updateProfile(values);
      if (!res.ok) {
        setFormError(res.error);
        Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) =>
          setError((k.startsWith("location") ? "location" : k) as FieldPath<ProfileInput>, { message: m }),
        );
        return;
      }
      setFreshUpload(null);
      reset(values);
      toast.success("Profile saved");
      router.refresh();
    } catch {
      setFormError("Network error — your changes weren't saved. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <section className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="relative">
          <UserAvatar name={fullName} src={avatarUrl} className="size-24 text-3xl" />
          {avatarUploading && (
            <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50 text-white">
              <Loader2 className="size-6 animate-spin" />
            </span>
          )}
        </div>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">A friendly photo helps buyers trust you. JPG, PNG or WebP up to 5 MB.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={avatarUploading}>
              <Camera /> {avatarUrl ? "Change photo" : "Upload photo"}
            </Button>
            {avatarUrl && (
              <Button type="button" variant="ghost" onClick={() => setValue("avatarUrl", null, { shouldDirty: true })}>
                <Trash2 /> Remove
              </Button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Upload avatar"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onAvatar(f);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2 sm:p-8">
        <FormField id="fullName" label="Full name" error={errors.fullName?.message}>
          <Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} {...register("fullName")} />
        </FormField>
        <FormField id="phone" label="Phone (optional)" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" placeholder="98765 43210" aria-invalid={!!errors.phone} {...register("phone")} />
          {!errors.phone && (
            <p className="text-xs text-muted-foreground">Shown on your listings so buyers can call or WhatsApp you. Leave empty to use chat only.</p>
          )}
        </FormField>
        <FormField id="college" label="College / area" error={errors.college?.message}>
          <Input id="college" placeholder="e.g. IIT Bombay, Powai" aria-invalid={!!errors.college} {...register("college")} />
        </FormField>
        <div className="sm:col-span-2">
          <FormField id="bio" label="Bio" error={errors.bio?.message}>
            <Textarea id="bio" rows={4} maxLength={500} placeholder="A line or two about you" aria-invalid={!!errors.bio} {...register("bio")} />
            <p className="text-right text-xs text-muted-foreground">{bio.length} / 500</p>
          </FormField>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Saved location</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Used to show distances when your device location isn&apos;t available, and pre-filled on new listings.
            </p>
          </div>
          <Controller
            control={control}
            name="location"
            render={({ field }) =>
              field.value ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => field.onChange(null)}>
                  <Trash2 /> Clear location
                </Button>
              ) : (
                <span />
              )
            }
          />
        </div>
        <Controller
          control={control}
          name="location"
          render={({ field }) => <LocationPicker id="profile-location" value={field.value} onChange={field.onChange} error={errors.location?.message} />}
        />
      </section>

      {formError && (
        <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {formError}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting || avatarUploading || !isDirty} className="min-w-40">
          {isSubmitting && <Loader2 className="animate-spin" />} Save profile
        </Button>
      </div>
    </form>
  );
}
