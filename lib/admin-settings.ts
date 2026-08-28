import { getEnv } from "@/lib/cloudflare";

const CURRENT_ITERATIONS = 100_000;
const LEGACY_ITERATIONS = [210_000];
const SETTING_ID = 1;
const MAX_LOGIN_FAILURES = 8;
const LOCK_DURATION_MS = 10 * 60 * 1000;

type AdminSettingsRow = {
  id: number;
  password_hash: string;
  password_salt: string;
  password_iterations: number | null;
  session_secret: string;
  session_version: number | null;
  recovery_code_hash: string | null;
  failed_login_count: number | null;
  locked_until: number | null;
  last_login_at: number | null;
  created_at: number;
  updated_at: number;
};

export type AdminLoginState = {
  locked: boolean;
  retryAfterSeconds: number;
  failures: number;
};

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function randomBase64(length = 48) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

function randomRecoveryCode() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const raw = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `VIDORA-${raw.match(/.{1,6}/g)?.join("-") ?? raw}`;
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function derivePasswordHash(password: string, saltBase64: string, iterations: number) {
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

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function recoveryCanonical(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

async function addColumnIfMissing(name: string, sqlType: string) {
  const db = getEnv().DB;
  const info = await db.prepare("PRAGMA table_info(admin_settings)").all<{ name: string }>();
  const columns = new Set((info.results ?? []).map((row) => row.name));
  if (!columns.has(name)) {
    await db.prepare(`ALTER TABLE admin_settings ADD COLUMN ${name} ${sqlType}`).run();
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
      session_version INTEGER DEFAULT 1,
      recovery_code_hash TEXT,
      failed_login_count INTEGER DEFAULT 0,
      locked_until INTEGER,
      last_login_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();

  await addColumnIfMissing("password_iterations", "INTEGER");
  await addColumnIfMissing("session_version", "INTEGER DEFAULT 1");
  await addColumnIfMissing("recovery_code_hash", "TEXT");
  await addColumnIfMissing("failed_login_count", "INTEGER DEFAULT 0");
  await addColumnIfMissing("locked_until", "INTEGER");
  await addColumnIfMissing("last_login_at", "INTEGER");
}

export async function getAdminSettings(): Promise<AdminSettingsRow | null> {
  await ensureAdminSettingsTable();
  return getEnv().DB
    .prepare(`
      SELECT id, password_hash, password_salt, password_iterations,
             session_secret, session_version, recovery_code_hash,
             failed_login_count, locked_until, last_login_at,
             created_at, updated_at
      FROM admin_settings WHERE id = ? LIMIT 1
    `)
    .bind(SETTING_ID)
    .first<AdminSettingsRow>();
}

export async function isAdminConfigured() {
  return Boolean(await getAdminSettings());
}

async function makePassword(password: string) {
  const salt = randomBase64(24);
  const hash = await derivePasswordHash(password, salt, CURRENT_ITERATIONS);
  return { salt, hash, iterations: CURRENT_ITERATIONS };
}

async function makeRecoveryCode() {
  const code = randomRecoveryCode();
  const hash = await sha256(recoveryCanonical(code));
  return { code, hash };
}

export async function setupAdmin(password: string) {
  await ensureAdminSettingsTable();
  if (await getAdminSettings()) throw new Error("ADMIN_ALREADY_CONFIGURED");

  const passwordData = await makePassword(password);
  const recovery = await makeRecoveryCode();
  const sessionSecret = randomBase64(48);
  const now = Date.now();

  await getEnv().DB.prepare(`
    INSERT INTO admin_settings (
      id, password_hash, password_salt, password_iterations,
      session_secret, session_version, recovery_code_hash,
      failed_login_count, locked_until, last_login_at,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?, ?)
  `).bind(
    SETTING_ID,
    passwordData.hash,
    passwordData.salt,
    passwordData.iterations,
    sessionSecret,
    1,
    recovery.hash,
    now,
    now,
    now
  ).run();

  return { recoveryCode: recovery.code };
}

async function setCurrentPassword(password: string, rotateSessionSecret = false) {
  const passwordData = await makePassword(password);
  const settings = await getAdminSettings();
  if (!settings) throw new Error("ADMIN_NOT_CONFIGURED");

  const nextSecret = rotateSessionSecret ? randomBase64(48) : settings.session_secret;
  const nextVersion = rotateSessionSecret ? (settings.session_version ?? 1) + 1 : (settings.session_version ?? 1);

  await getEnv().DB.prepare(`
    UPDATE admin_settings
    SET password_hash = ?, password_salt = ?, password_iterations = ?,
        session_secret = ?, session_version = ?, failed_login_count = 0,
        locked_until = NULL, updated_at = ?
    WHERE id = ?
  `).bind(
    passwordData.hash,
    passwordData.salt,
    passwordData.iterations,
    nextSecret,
    nextVersion,
    Date.now(),
    SETTING_ID
  ).run();
}

async function verifyHashCandidate(password: string, settings: AdminSettingsRow) {
  const iterationCandidates = settings.password_iterations && settings.password_iterations > 0
    ? [settings.password_iterations]
    : [CURRENT_ITERATIONS, ...LEGACY_ITERATIONS];

  const passwordCandidates = [password];
  const trimmed = password.trim();
  if (trimmed !== password && trimmed.length >= 8) passwordCandidates.push(trimmed);

  for (const candidate of passwordCandidates) {
    for (const iterations of iterationCandidates) {
      try {
        const actual = await derivePasswordHash(candidate, settings.password_salt, iterations);
        if (!timingSafeEqual(actual, settings.password_hash)) continue;

        if (iterations !== CURRENT_ITERATIONS || settings.password_iterations !== CURRENT_ITERATIONS) {
          await setCurrentPassword(candidate, false);
        }
        return { valid: true, normalizedPassword: candidate, upgraded: iterations !== CURRENT_ITERATIONS };
      } catch (error) {
        console.warn(`Password compatibility check failed (${iterations}):`, error);
      }
    }
  }

  return { valid: false, normalizedPassword: password, upgraded: false };
}


async function ensureLoginAttemptsTable() {
  await getEnv().DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_login_attempts (
      attempt_key TEXT PRIMARY KEY NOT NULL,
      failed_count INTEGER NOT NULL DEFAULT 0,
      locked_until INTEGER,
      updated_at INTEGER NOT NULL
    )
  `).run();
}

async function attemptKey(value: string) {
  return sha256(`vidora-login:${value || "unknown"}`);
}


export async function getAdminLoginState(clientId = "unknown"): Promise<AdminLoginState> {
  await ensureLoginAttemptsTable();
  const key = await attemptKey(clientId);
  const row = await getEnv().DB
    .prepare(`
      SELECT failed_count, locked_until
      FROM admin_login_attempts
      WHERE attempt_key = ?
      LIMIT 1
    `)
    .bind(key)
    .first<{ failed_count: number; locked_until: number | null }>();

  if (!row) return { locked: false, retryAfterSeconds: 0, failures: 0 };

  const lockedUntil = row.locked_until ?? 0;
  const remaining = Math.max(0, lockedUntil - Date.now());

  if (remaining <= 0 && lockedUntil > 0) {
    await getEnv().DB
      .prepare("DELETE FROM admin_login_attempts WHERE attempt_key = ?")
      .bind(key)
      .run();
    return { locked: false, retryAfterSeconds: 0, failures: 0 };
  }

  return {
    locked: remaining > 0,
    retryAfterSeconds: Math.ceil(remaining / 1000),
    failures: row.failed_count ?? 0
  };
}

export async function registerLoginFailure(clientId = "unknown") {
  await ensureLoginAttemptsTable();
  const key = await attemptKey(clientId);
  const current = await getAdminLoginState(clientId);
  const failures = current.failures + 1;
  const shouldLock = failures >= MAX_LOGIN_FAILURES;
  const now = Date.now();

  await getEnv().DB.prepare(`
    INSERT INTO admin_login_attempts (
      attempt_key, failed_count, locked_until, updated_at
    ) VALUES (?, ?, ?, ?)
    ON CONFLICT(attempt_key) DO UPDATE SET
      failed_count = excluded.failed_count,
      locked_until = excluded.locked_until,
      updated_at = excluded.updated_at
  `).bind(
    key,
    shouldLock ? 0 : failures,
    shouldLock ? now + LOCK_DURATION_MS : null,
    now
  ).run();
}

export async function registerLoginSuccess(clientId = "unknown") {
  await ensureLoginAttemptsTable();
  const key = await attemptKey(clientId);

  await getEnv().DB
    .prepare("DELETE FROM admin_login_attempts WHERE attempt_key = ?")
    .bind(key)
    .run();

  await getEnv().DB.prepare(`
    UPDATE admin_settings
    SET failed_login_count = 0,
        locked_until = NULL,
        last_login_at = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(Date.now(), Date.now(), SETTING_ID).run();
}

export async function verifyStoredAdminPassword(password: string) {
  const settings = await getAdminSettings();
  if (!settings) return { valid: false, upgraded: false, usedEnvFallback: false };

  const stored = await verifyHashCandidate(password, settings);
  if (stored.valid) return { valid: true, upgraded: stored.upgraded, usedEnvFallback: false };

  const envPassword = getEnv().ADMIN_PASSWORD;
  if (envPassword) {
    const candidates = [password, password.trim()].filter((value, index, array) => value && array.indexOf(value) === index);
    if (candidates.some((candidate) => timingSafeEqual(candidate, envPassword))) {
      await setCurrentPassword(envPassword, false);
      return { valid: true, upgraded: true, usedEnvFallback: true };
    }
  }

  return { valid: false, upgraded: false, usedEnvFallback: false };
}

export async function ensureRecoveryCode() {
  const settings = await getAdminSettings();
  if (!settings) throw new Error("ADMIN_NOT_CONFIGURED");
  if (settings.recovery_code_hash) return null;

  const recovery = await makeRecoveryCode();
  await getEnv().DB.prepare(`
    UPDATE admin_settings SET recovery_code_hash = ?, updated_at = ? WHERE id = ?
  `).bind(recovery.hash, Date.now(), SETTING_ID).run();
  return recovery.code;
}

export async function recoverAdminPassword(recoveryCode: string, newPassword: string) {
  const settings = await getAdminSettings();
  if (!settings?.recovery_code_hash) return null;

  const candidate = await sha256(recoveryCanonical(recoveryCode));
  if (!timingSafeEqual(candidate, settings.recovery_code_hash)) return null;

  await setCurrentPassword(newPassword, true);
  const nextRecovery = await makeRecoveryCode();
  await getEnv().DB.prepare(`
    UPDATE admin_settings SET recovery_code_hash = ?, updated_at = ? WHERE id = ?
  `).bind(nextRecovery.hash, Date.now(), SETTING_ID).run();
  return { recoveryCode: nextRecovery.code };
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const verified = await verifyStoredAdminPassword(currentPassword);
  if (!verified.valid) return null;

  await setCurrentPassword(newPassword, true);
  const nextRecovery = await makeRecoveryCode();
  await getEnv().DB.prepare(`
    UPDATE admin_settings SET recovery_code_hash = ?, updated_at = ? WHERE id = ?
  `).bind(nextRecovery.hash, Date.now(), SETTING_ID).run();
  return { recoveryCode: nextRecovery.code };
}

export async function getStoredSessionSecret() {
  const settings = await getAdminSettings();
  return settings?.session_secret ?? null;
}

export async function getSessionVersion() {
  const settings = await getAdminSettings();
  return settings?.session_version ?? 1;
}
