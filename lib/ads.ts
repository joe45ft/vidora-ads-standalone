import { and, desc, eq, gt, isNull, lt, or, sql } from "drizzle-orm";
import { advertisements, type Advertisement } from "@/db/schema";
import { ensureAdvertisementsTable } from "@/lib/advertisements-table";
import { getDb } from "@/lib/db";

export function getAdStatus(ad: Advertisement, now = new Date()) {
  if (ad.archived) return "archived";
  if (!ad.published) return "draft";
  if (ad.startsAt && ad.startsAt > now) return "scheduled";
  if (ad.endsAt && ad.endsAt < now) return "expired";
  return "active";
}

export async function listPublicAds() {
  await ensureAdvertisementsTable();
  const db = getDb();
  const now = new Date();

  return db
    .select()
    .from(advertisements)
    .where(
      and(
        eq(advertisements.published, true),
        eq(advertisements.archived, false),
        or(isNull(advertisements.startsAt), lt(advertisements.startsAt, now)),
        or(isNull(advertisements.endsAt), gt(advertisements.endsAt, now))
      )
    )
    .orderBy(desc(advertisements.featured), desc(advertisements.createdAt));
}

export async function listAllAds() {
  await ensureAdvertisementsTable();
  return getDb()
    .select()
    .from(advertisements)
    .orderBy(desc(advertisements.createdAt));
}

function publicAdCondition(id: string, now = new Date()) {
  return and(
    eq(advertisements.id, id),
    eq(advertisements.published, true),
    eq(advertisements.archived, false),
    or(isNull(advertisements.startsAt), lt(advertisements.startsAt, now)),
    or(isNull(advertisements.endsAt), gt(advertisements.endsAt, now))
  );
}

export async function incrementView(id: string) {
  await ensureAdvertisementsTable();
  await getDb()
    .update(advertisements)
    .set({ views: sql`${advertisements.views} + 1` })
    .where(publicAdCondition(id));
}

export async function incrementClick(id: string) {
  await ensureAdvertisementsTable();
  await getDb()
    .update(advertisements)
    .set({ clicks: sql`${advertisements.clicks} + 1` })
    .where(publicAdCondition(id));
}
