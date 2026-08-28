import { getEnv } from "@/lib/cloudflare";

let ready: Promise<void> | null = null;

async function createSchema() {
  const db = getEnv().DB;

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS advertisements (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      course_name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      headline TEXT,
      description TEXT,
      image_url TEXT,
      ad_type TEXT NOT NULL DEFAULT 'course',
      original_price INTEGER,
      offer_price INTEGER NOT NULL,
      cta_text TEXT NOT NULL DEFAULT 'سجل الآن',
      cta_url TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 0,
      archived INTEGER NOT NULL DEFAULT 0,
      starts_at INTEGER,
      ends_at INTEGER,
      views INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();

  // Upgrade older databases automatically without requiring a manual migration.
  const tableInfo = await db.prepare("PRAGMA table_info(advertisements)").all<{ name: string }>();
  const columns = new Set((tableInfo.results ?? []).map((column) => column.name));

  if (!columns.has("ad_type")) {
    await db.prepare(
      "ALTER TABLE advertisements ADD COLUMN ad_type TEXT NOT NULL DEFAULT 'course'"
    ).run();
  }

  // Existing discounted records are recognized automatically as offers.
  await db.prepare(`
    UPDATE advertisements
    SET ad_type = 'offer'
    WHERE original_price IS NOT NULL
      AND original_price > offer_price
      AND (ad_type IS NULL OR ad_type = 'course')
  `).run();

  await db.prepare(`
    UPDATE advertisements
    SET ad_type = 'course'
    WHERE ad_type IS NULL OR ad_type NOT IN ('course', 'offer')
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS ads_public_idx
    ON advertisements (published, archived, starts_at, ends_at)
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS ads_featured_idx
    ON advertisements (featured, published)
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS ads_type_idx
    ON advertisements (ad_type, published, archived)
  `).run();
}

export async function ensureAdvertisementsTable() {
  if (!ready) {
    ready = createSchema().catch((error) => {
      ready = null;
      throw error;
    });
  }

  await ready;
}
