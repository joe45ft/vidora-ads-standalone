import { cookies } from "next/headers";
import { getEnv } from "@/lib/cloudflare";

const COOKIE = "vidora_ads_admin";

function hex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sign(value: string) {
  const secret = getEnv().SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
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
    maxAge: 60 * 60 * 12
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
  const [issued, signature] = value.split(".");
  if (!issued || !signature) return false;
  const age = Date.now() - Number(issued);
  if (!Number.isFinite(age) || age < 0 || age > 12 * 60 * 60 * 1000) return false;
  return (await sign(issued)) === signature;
}

export function verifyAdminPassword(password: string) {
  const expected = getEnv().ADMIN_PASSWORD;
  return Boolean(expected && password === expected);
}
