import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { advertisements } from "@/db/schema";
import { apiError, rejectCrossOrigin } from "@/lib/api-utils";
import { ensureAdvertisementsTable } from "@/lib/advertisements-table";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "unauthorized", message: "انتهت جلسة الإدارة. سجل الدخول مرة أخرى." },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  try {
    await ensureAdvertisementsTable();
    const db = getDb();
    const [source] = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .limit(1);

    if (!source) {
      return NextResponse.json(
        { error: "not_found", message: "الإعلان غير موجود." },
        { status: 404 }
      );
    }

    const newId = crypto.randomUUID();
    await db.insert(advertisements).values({
      ...source,
      id: newId,
      slug: `${source.slug}-copy-${newId.slice(0, 6)}`,
      title: `${source.title} - نسخة`,
      featured: false,
      published: false,
      archived: false,
      views: 0,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ ok: true, id: newId });
  } catch (error) {
    return apiError(error, "تعذر نسخ الإعلان.");
  }
}
