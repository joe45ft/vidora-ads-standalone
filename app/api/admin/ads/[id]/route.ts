import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { advertisements } from "@/db/schema";
import { apiError, rejectCrossOrigin } from "@/lib/api-utils";
import { ensureAdvertisementsTable } from "@/lib/advertisements-table";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { adInputSchema } from "@/lib/validation";
import { normalizePublicImageUrl, validatePublicActionUrl } from "@/lib/url";

function unauthorized() {
  return NextResponse.json(
    { error: "unauthorized", message: "انتهت جلسة الإدارة. سجل الدخول مرة أخرى." },
    { status: 401 }
  );
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await context.params;

  try {
    await ensureAdvertisementsTable();
    const input = adInputSchema.parse(await request.json());
    const db = getDb();

    const existing = await db
      .select({ id: advertisements.id })
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json(
        { error: "not_found", message: "الإعلان غير موجود." },
        { status: 404 }
      );
    }

    await db
      .update(advertisements)
      .set({
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
        updatedAt: new Date()
      })
      .where(eq(advertisements.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, "تعذر تحديث الإعلان.");
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await context.params;

  try {
    await ensureAdvertisementsTable();
    await getDb().delete(advertisements).where(eq(advertisements.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, "تعذر حذف الإعلان.");
  }
}
