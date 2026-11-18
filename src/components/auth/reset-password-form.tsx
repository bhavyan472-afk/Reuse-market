"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/lib/actions/auth";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { FormField } from "./auth-shell";
import { PasswordInput } from "./password-input";

export function ResetPasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    setFormError(null);
    try {
      const res = await updatePassword(values);
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      toast.success("Password updated — you're signed in.");
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError("Network error — please check your connection and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField id="password" label="New password" error={errors.password?.message}>
        <PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} {...register("password")} />
      </FormField>
      <FormField id="confirmPassword" label="Confirm new password" error={errors.confirmPassword?.message}>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
          {...register("confirmPassword")}
        />
      </FormField>
      {formError && (
        <div role="alert" className="space-y-2 rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p>{formError}</p>
          {/expired/i.test(formError) && (
            <Link href="/forgot-password" className="font-medium underline">
              Request a new link
            </Link>
          )}
        </div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />} Update password
      </Button>
    </form>
  );
}
