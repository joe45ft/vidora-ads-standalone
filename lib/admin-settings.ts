import { getEnv } from "@/lib/cloudflare";

const CURRENT_ITERATIONS = 100_000;
const LEGACY_ITERATIONS = [210_000];
const SETTING_ID = 1;

type AdminSettingsRow = {
  id: number;
  password_hash: string;
  password_salt: string;
  password_iterations: number | null;
  session_secret: string;
  created_at: number;
  updated_at: number;
};

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function randomBase64(length = 48) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

async function derivePasswordHash(
  password: string,
  saltBase64: string,
  iterations: number
) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64ToBytes(saltBase64),
      iterations
    },
    material,
    256
  );

  return bytesToBase64(new Uint8Array(bits));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function ensurePasswordIterationsColumn() {
  const db = getEnv().DB;
  const info = await db
    .prepare("PRAGMA table_info(admin_settings)")
    .all<{ name: string }>();

  const columns = new Set((info.results ?? []).map((row) => row.name));

  if (!columns.has("password_iterations")) {
    await db
      .prepare("ALTER TABLE admin_settings ADD COLUMN password_iterations INTEGER")
      .run();
  }
}

export async function ensureAdminSettingsTable() {
  await getEnv().DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id INTEGER PRIMARY KEY NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      password_iterations INTEGER,
      session_secret TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();

  await ensurePasswordIterationsColumn();
}

export async function getAdminSettings(): Promise<AdminSettingsRow | null> {
  await ensureAdminSettingsTable();

  return getEnv().DB
    .prepare(`
      SELECT
        id,
        password_hash,
        password_salt,
        password_iterations,
        session_secret,
        created_at,
        updated_at
      FROM admin_settings
      WHERE id = ?
      LIMIT 1
    `)
    .bind(SETTING_ID)
    .first<AdminSettingsRow>();
}

export async function isAdminConfigured() {
  return Boolean(await getAdminSettings());
}

export async function setupAdmin(password: string) {
  await ensureAdminSettingsTable();

  const existing = await getAdminSettings();
  if (existing) {
    throw new Error("ADMIN_ALREADY_CONFIGURED");
  }

  const salt = randomBase64(24);
  const passwordHash = await derivePasswordHash(
    password,
    salt,
    CURRENT_ITERATIONS
  );
  const sessionSecret = randomBase64(48);
  const now = Date.now();

  await getEnv().DB
    .prepare(`
      INSERT INTO admin_settings (
        id,
        password_hash,
        password_salt,
        password_iterations,
        session_secret,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      SETTING_ID,
      passwordHash,
      salt,
      CURRENT_ITERATIONS,
      sessionSecret,
      now,
      now
    )
    .run();

  return { sessionSecret };
}

async function upgradePasswordHash(password: string) {
  const salt = randomBase64(24);
  const passwordHash = await derivePasswordHash(
    password,
    salt,
    CURRENT_ITERATIONS
  );

  await getEnv().DB
    .prepare(`
      UPDATE admin_settings
      SET
        password_hash = ?,
        password_salt = ?,
        password_iterations = ?,
        updated_at = ?
      WHERE id = ?
    `)
    .bind(
      passwordHash,
      salt,
      CURRENT_ITERATIONS,
      Date.now(),
      SETTING_ID
    )
    .run();
}

export async function verifyStoredAdminPassword(password: string) {
  const settings = await getAdminSettings();
  if (!settings) return false;

  const candidates =
    settings.password_iterations && settings.password_iterations > 0
      ? [settings.password_iterations]
      : [CURRENT_ITERATIONS, ...LEGACY_ITERATIONS];

  for (const iterations of candidates) {
    try {
      const actual = await derivePasswordHash(
        password,
        settings.password_salt,
        iterations
      );

      if (!timingSafeEqual(actual, settings.password_hash)) {
        continue;
      }

      // Old records did not store their iteration count. Once the correct
      // password is proven, transparently migrate them to the current format.
      if (
        settings.password_iterations !== CURRENT_ITERATIONS ||
        iterations !== CURRENT_ITERATIONS
      ) {
        await upgradePasswordHash(password);
      } else if (!settings.password_iterations) {
        await getEnv().DB
          .prepare(`
            UPDATE admin_settings
            SET password_iterations = ?, updated_at = ?
            WHERE id = ?
          `)
          .bind(CURRENT_ITERATIONS, Date.now(), SETTING_ID)
          .run();
      }

      return true;
    } catch (error) {
      console.warn(
        `Admin password compatibility check failed for ${iterations} iterations:`,
        error
      );
    }
  }

  return false;
}

export async function getStoredSessionSecret() {
  const settings = await getAdminSettings();
  return settings?.session_secret ?? null;
}
