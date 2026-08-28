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

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS ads_public_idx
    ON advertisements (published, archived, starts_at, ends_at)
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS ads_featured_idx
    ON advertisements (featured, published)
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
