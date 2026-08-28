import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const nullableDate = z.union([z.string().datetime(), z.literal(""), z.null()]).optional();
const money = z.coerce.number().finite().int("السعر يجب أن يكون رقمًا صحيحًا.").nonnegative("السعر لا يمكن أن يكون سالبًا.").max(100_000_000);
const optionalMoney = z.preprocess(
  (value) => value === "" || value == null ? null : value,
  z.union([money, z.null()])
);

export const adInputSchema = z.object({
  title: z.string().trim().min(2, "اسم الإعلان مطلوب.").max(120),
  courseName: z.string().trim().min(2, "اسم الكورس مطلوب.").max(160),
  category: z.string().trim().min(2, "التصنيف مطلوب.").max(80).default("General"),
  headline: optionalText(180),
  description: optionalText(2000),
  imageUrl: optionalText(1200),
  originalPrice: optionalMoney.optional(),
  offerPrice: money,
  ctaText: z.string().trim().min(1, "نص زر التسجيل مطلوب.").max(60).default("سجل الآن"),
  ctaUrl: z.string().trim().max(1200).default(""),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  archived: z.boolean().default(false),
  startsAt: nullableDate,
  endsAt: nullableDate
}).superRefine((value, ctx) => {
  if (value.published && !value.archived && !value.ctaUrl.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["ctaUrl"],
      message: "رابط التسجيل مطلوب عند نشر الإعلان."
    });
  }

  if (value.startsAt && value.endsAt) {
    const start = new Date(value.startsAt).getTime();
    const end = new Date(value.endsAt).getTime();
    if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "نهاية العرض يجب أن تكون بعد بداية العرض."
      });
    }
  }

  if (value.originalPrice != null && value.originalPrice < value.offerPrice) {
    ctx.addIssue({
      code: "custom",
      path: ["originalPrice"],
      message: "السعر الأصلي يجب ألا يكون أقل من سعر العرض."
    });
  }
});

export type AdInput = z.infer<typeof adInputSchema>;
