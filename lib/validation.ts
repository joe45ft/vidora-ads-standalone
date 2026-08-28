import { z } from "zod";

const nullableDate = z.union([z.string().datetime(), z.literal(""), z.null()]).optional();

export const adInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  courseName: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(80).default("General"),
  headline: z.string().trim().max(180).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  imageUrl: z.string().trim().max(1200).optional().nullable(),
  originalPrice: z.number().int().nonnegative().optional().nullable(),
  offerPrice: z.number().int().nonnegative(),
  ctaText: z.string().trim().min(1).max(60).default("سجل الآن"),
  ctaUrl: z.string().trim().url().max(1200),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  archived: z.boolean().default(false),
  startsAt: nullableDate,
  endsAt: nullableDate
});

export type AdInput = z.infer<typeof adInputSchema>;
