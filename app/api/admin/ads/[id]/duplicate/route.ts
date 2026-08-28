import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { advertisements } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const db = getDb();
  const [source] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
  if (!source) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const newId = crypto.randomUUID();
  await db.insert(advertisements).values({
    ...source,
    id: newId,
    slug: `${source.slug}-copy-${newId.slice(0, 6)}`,
    title: `${source.title} - Copy`,
    featured: false,
    published: false,
    archived: false,
    views: 0,
    clicks: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return NextResponse.json({ ok: true, id: newId });
}
