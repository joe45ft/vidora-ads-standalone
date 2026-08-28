import { getEnv } from "@/lib/cloudflare";

const ITERATIONS = 210_000;
const SETTING_ID = 1;

type AdminSettingsRow = {
  id: number;
  password_hash: string;
  password_salt: string;
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

async function derivePasswordHash(password: string, saltBase64: string) {
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
      iterations: ITERATIONS
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

export async function ensureAdminSettingsTable() {
  await getEnv().DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id INTEGER PRIMARY KEY NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      session_secret TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
}

export async function getAdminSettings(): Promise<AdminSettingsRow | null> {
  await ensureAdminSettingsTable();
  return getEnv().DB
    .prepare("SELECT * FROM admin_settings WHERE id = ? LIMIT 1")
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
  const passwordHash = await derivePasswordHash(password, salt);
  const sessionSecret = randomBase64(48);
  const now = Date.now();

  await getEnv().DB
    .prepare(`
      INSERT INTO admin_settings (
        id, password_hash, password_salt, session_secret, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(SETTING_ID, passwordHash, salt, sessionSecret, now, now)
    .run();

  return { sessionSecret };
}

export async function verifyStoredAdminPassword(password: string) {
  const settings = await getAdminSettings();
  if (!settings) return false;
  const actual = await derivePasswordHash(password, settings.password_salt);
  return timingSafeEqual(actual, settings.password_hash);
}

export async function getStoredSessionSecret() {
  const settings = await getAdminSettings();
  return settings?.session_secret ?? null;
}
