"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/actions/auth";
import { env } from "@/lib/env";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { FormField } from "./auth-shell";
import { GoogleButton, OrDivider } from "./google-button";
import { PasswordInput } from "./password-input";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    try {
      const res = await signIn(values);
      if (!res.ok) {
        setFormError(res.error);
        Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => setError(k as keyof LoginInput, { message: m }));
        return;
      }
      toast.success("Welcome back!");
      router.replace(next);
      router.refresh();
    } catch {
      setFormError("Network error — please check your connection and try again.");
    }
  };

  return (
    <div className="space-y-6">
      {env.googleAuthEnabled && (
        <>
          <GoogleButton next={next} />
          <OrDivider />
        </>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </FormField>
        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
          aside={
            <Link href="/forgot-password" className="text-xs text-brand underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
        </FormField>
        {formError && (
          <p role="alert" className="rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Sign in
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-brand underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
