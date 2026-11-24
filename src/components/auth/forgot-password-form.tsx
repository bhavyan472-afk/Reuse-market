"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/actions/auth";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { FormField } from "./auth-shell";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setFormError(null);
    try {
      const res = await requestPasswordReset(values);
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setSentTo(values.email);
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
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          If an account exists for <strong className="text-foreground">{sentTo}</strong>, you&apos;ll get a link to choose a
          new password. It expires in one hour.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
      </FormField>
      {formError && (
        <p role="alert" className="rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />} Send reset link
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-brand underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
