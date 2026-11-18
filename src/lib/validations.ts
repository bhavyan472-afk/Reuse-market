import { z } from "zod";
import { CATEGORY_VALUES, CONDITION_VALUES, MAX_IMAGES } from "@/lib/constants";
import { normalizePhone } from "@/lib/sanitize";

const REPORT_REASON_VALUES = ["spam", "scam", "prohibited", "wrong_category", "offensive", "other"] as const;

// ---------------------------------------------------------------- auth
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .email("Enter a valid email address");

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(72, "Password is too long"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your name").max(80, "Name is too long"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ---------------------------------------------------------------- location
export const locationSchema = z.object({
  address: z.string().trim().min(2, "Choose a location").max(300, "Address is too long"),
  city: z.string().trim().min(1, "City is required").max(100, "City is too long"),
  lat: z.number({ error: "Pick a point on the map" }).min(-90).max(90),
  lng: z.number({ error: "Pick a point on the map" }).min(-180).max(180),
});
export type LocationValue = z.infer<typeof locationSchema>;

// ---------------------------------------------------------------- listings
export const listingImageSchema = z.object({
  url: z.string().url().max(1000),
  path: z.string().max(500).nullable(),
});
export type ListingImageInput = z.infer<typeof listingImageSchema>;

export const listingSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Keep the title under 100 characters"),
  category: z.enum(CATEGORY_VALUES, { error: "Choose a category" }),
  description: z
    .string()
    .trim()
    .min(10, "Describe the item in at least 10 characters")
    .max(3000, "Keep the description under 3000 characters"),
  price: z
    .number({ error: "Enter a price" })
    .int("Use whole rupees")
    .min(0, "Price cannot be negative")
    .max(10_000_000, "Price looks too high"),
  condition: z.enum(CONDITION_VALUES, { error: "Choose a condition" }),
  location: locationSchema.nullable().refine((v) => v !== null, { message: "Choose where buyers can meet you" }),
  images: z
    .array(listingImageSchema)
    .min(1, "Add at least one photo")
    .max(MAX_IMAGES, `You can add up to ${MAX_IMAGES} photos`),
});
export type ListingInput = z.infer<typeof listingSchema>;
export type ListingFormValues = z.input<typeof listingSchema>;

// ---------------------------------------------------------------- profile
export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .refine((v) => v === "" || normalizePhone(v) !== null, "Enter a valid phone number, e.g. 98765 43210"),
  college: z.string().trim().max(120, "Keep this under 120 characters"),
  bio: z.string().trim().max(500, "Keep your bio under 500 characters"),
  avatarUrl: z.string().url().max(1000).nullable(),
  location: locationSchema.nullable(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------- messaging / reports
export const messageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long (2000 characters max)"),
});

export const reportSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.enum(REPORT_REASON_VALUES, { error: "Choose a reason" }),
  details: z.string().trim().max(1000, "Keep details under 1000 characters"),
});
export type ReportInput = z.infer<typeof reportSchema>;

export const uuidSchema = z.string().uuid();
