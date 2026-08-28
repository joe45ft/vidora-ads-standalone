import { cookies } from "next/headers";
import {
  getSessionVersion,
  getStoredSessionSecret,
  verifyStoredAdminPassword
} from "@/lib/admin-settings";

const COOKIE = "vidora_ads_admin";
const NORMAL_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const REMEMBER_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function hex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(value: string) {
  const secret = await getStoredSessionSecret();
  if (!secret) throw new Error("ADMIN_NOT_CONFIGURED");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

export async function createAdminSession(rememberMe = false) {
  const issued = Date.now();
  const maxAge = rememberMe ? REMEMBER_MAX_AGE_MS : NORMAL_MAX_AGE_MS;
  const expires = issued + maxAge;
  const version = await getSessionVersion();
  const payload = `${version}.${issued}.${expires}`;
  const signature = await sign(payload);
  const store = await cookies();

  store.set(COOKIE, `v2.${payload}.${signature}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: Math.floor(maxAge / 1000)
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

async function validateV2(value: string) {
  const parts = value.split(".");
  if (parts.length !== 5 || parts[0] !== "v2") return false;

  const [, versionRaw, issuedRaw, expiresRaw, signature] = parts;
  const version = Number(versionRaw);
  const issued = Number(issuedRaw);
  const expires = Number(expiresRaw);
  if (![version, issued, expires].every(Number.isFinite)) return false;
  if (issued > Date.now() + 60_000 || expires <= Date.now() || expires <= issued) return false;
  if (version !== await getSessionVersion()) return false;

  const payload = `${versionRaw}.${issuedRaw}.${expiresRaw}`;
  return timingSafeEqual(await sign(payload), signature);
}

async function validateLegacy(value: string) {
  const separator = value.lastIndexOf(".");
  if (separator < 1) return false;
  const issued = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const issuedNumber = Number(issued);
  const age = Date.now() - issuedNumber;
  if (!Number.isFinite(issuedNumber) || age < 0 || age > NORMAL_MAX_AGE_MS) return false;
  return timingSafeEqual(await sign(issued), signature);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (!value) return false;

  try {
    return value.startsWith("v2.") ? await validateV2(value) : await validateLegacy(value);
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(password: string) {
  return verifyStoredAdminPassword(password);
}
