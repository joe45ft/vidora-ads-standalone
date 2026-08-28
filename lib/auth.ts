import { cookies } from "next/headers";
import {
  getStoredSessionSecret,
  verifyStoredAdminPassword
} from "@/lib/admin-settings";

const COOKIE = "vidora_ads_admin";
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function hex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
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

export async function createAdminSession() {
  const issued = Date.now().toString();
  const signature = await sign(issued);
  const store = await cookies();

  store.set(COOKIE, `${issued}.${signature}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000)
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (!value) return false;

  const separator = value.lastIndexOf(".");
  if (separator < 1) return false;

  const issued = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!issued || !signature) return false;

  const issuedNumber = Number(issued);
  const age = Date.now() - issuedNumber;
  if (!Number.isFinite(issuedNumber) || age < 0 || age > SESSION_MAX_AGE_MS) return false;

  try {
    return timingSafeEqual(await sign(issued), signature);
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(password: string) {
  return verifyStoredAdminPassword(password);
}
