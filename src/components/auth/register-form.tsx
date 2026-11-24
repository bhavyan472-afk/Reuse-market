"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/actions/auth";
import { env } from "@/lib/env";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { FormField } from "./auth-shell";
import { GoogleButton, OrDivider } from "./google-button";
import { PasswordInput } from "./password-input";

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);
    try {
      const res = await signUp(values);
      if (!res.ok) {
        setFormError(res.error);
        Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => setError(k as keyof RegisterInput, { message: m }));
        return;
      }
      if (res.data.needsConfirmation) {
        setSentTo(values.email);
        return;
      }
      toast.success("Welcome to ReUse Market!");
      router.replace(next);
      router.refresh();
    } catch {
      setFormError("Network error — please check your connection and try again.");
    }
  };

  if (sentTo) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-gold-text">
          <MailCheck className="size-6" />
        </span>
        <h2 className="text-xl font-bold">Check your inbox</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a confirmation link to <strong className="text-foreground">{sentTo}</strong>. Open it on this device to
          activate your account, then you&apos;ll be signed in automatically.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {env.googleAuthEnabled && (
        <>
          <GoogleButton next={next} />
          <OrDivider />
        </>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField id="fullName" label="Full name" error={errors.fullName?.message}>
          <Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "fullName-error" : undefined} {...register("fullName")} />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : "password-hint"}
            {...register("password")}
          />
          {!errors.password && (
            <p id="password-hint" className="text-xs text-muted-foreground">
              At least 8 characters, including a letter and a number.
            </p>
          )}
        </FormField>
        <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            {...register("confirmPassword")}
          />
        </FormField>
        {formError && (
          <p role="alert" className="rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Create account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By joining you agree to meet safely, list honestly and treat others kindly.
        </p>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-brand underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
