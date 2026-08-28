import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { advertisements } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { adInputSchema } from "@/lib/validation";
import { normalizePublicImageUrl, validatePublicActionUrl } from "@/lib/url";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;

  try {
    const input = adInputSchema.parse(await request.json());

    await getDb()
      .update(advertisements)
      .set({
        title: input.title,
        courseName: input.courseName,
        category: input.category,
        headline: input.headline || null,
        description: input.description || null,
        imageUrl: normalizePublicImageUrl(input.imageUrl),
        originalPrice: input.originalPrice ?? null,
        offerPrice: input.offerPrice,
        ctaText: input.ctaText,
        ctaUrl: validatePublicActionUrl(input.ctaUrl),
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
    return NextResponse.json({ error: "invalid_input", details: String(error) }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  await getDb().delete(advertisements).where(eq(advertisements.id, id));
  return NextResponse.json({ ok: true });
}
