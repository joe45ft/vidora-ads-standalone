import { NextResponse } from "next/server";
import { advertisements } from "@/db/schema";
import { apiError, rejectCrossOrigin } from "@/lib/api-utils";
import { ensureAdvertisementsTable } from "@/lib/advertisements-table";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listAllAds } from "@/lib/ads";
import { adInputSchema } from "@/lib/validation";
import { normalizePublicImageUrl, validatePublicActionUrl } from "@/lib/url";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "course";
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "unauthorized", message: "انتهت جلسة الإدارة. سجل الدخول مرة أخرى." },
      { status: 401 }
    );
  }

  try {
    return NextResponse.json(await listAllAds());
  } catch (error) {
    return apiError(error, "تعذر تحميل الإعلانات.");
  }
}

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "unauthorized", message: "انتهت جلسة الإدارة. سجل الدخول مرة أخرى." },
      { status: 401 }
    );
  }

  try {
    await ensureAdvertisementsTable();
    const input = adInputSchema.parse(await request.json());
    const now = new Date();
    const id = crypto.randomUUID();
    const slug = `${slugify(input.courseName || input.title)}-${id.slice(0, 8)}`;

    await getDb().insert(advertisements).values({
      id,
      slug,
      title: input.title,
      courseName: input.courseName,
      category: input.category,
      headline: input.headline || null,
      description: input.description || null,
      imageUrl: normalizePublicImageUrl(input.imageUrl),
      adType: input.adType,
      originalPrice: input.adType === "offer" ? input.originalPrice ?? null : null,
      offerPrice: input.offerPrice,
      ctaText: input.ctaText,
      ctaUrl: validatePublicActionUrl(input.ctaUrl, {
        required: input.published && !input.archived
      }),
      featured: input.featured,
      published: input.published,
      archived: input.archived,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      views: 0,
      clicks: 0,
      createdAt: now,
      updatedAt: now
    });

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    return apiError(error, "تعذر حفظ الإعلان.");
  }
}
