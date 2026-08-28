import { NextResponse } from "next/server";
import { advertisements } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listAllAds } from "@/lib/ads";
import { adInputSchema } from "@/lib/validation";
import { normalizePublicImageUrl, validatePublicActionUrl } from "@/lib/url";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await listAllAds());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
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
      originalPrice: input.originalPrice ?? null,
      offerPrice: input.offerPrice,
      ctaText: input.ctaText,
      ctaUrl: validatePublicActionUrl(input.ctaUrl),
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
    return NextResponse.json({ error: "invalid_input", details: String(error) }, { status: 400 });
  }
}
