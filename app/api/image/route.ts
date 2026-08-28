import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { advertisements } from "@/db/schema";
import { ensureAdvertisementsTable } from "@/lib/advertisements-table";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { normalizePublicImageUrl } from "@/lib/url";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_REDIRECTS = 4;

function isUnsafeHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal"
  ) return true;

  // Public image links should use a hostname, not a literal IP address.
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.includes(":")) return true;

  return false;
}

function validateRemoteUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || isUnsafeHost(url.hostname)) {
    throw new Error("UNSAFE_IMAGE_URL");
  }
  return url;
}

async function isAuthorizedImageSource(raw: string, normalized: string) {
  try {
    if (await isAdminAuthenticated()) return true;
  } catch {
    // Continue with the public-ad lookup.
  }

  await ensureAdvertisementsTable();
  const matches = await getDb()
    .select({ id: advertisements.id })
    .from(advertisements)
    .where(or(eq(advertisements.imageUrl, raw.trim()), eq(advertisements.imageUrl, normalized)))
    .limit(1);

  if (matches.length > 0) return true;

  try {
    const settings = await getSiteSettings();
    const logoRaw = settings.logoUrl?.trim() ?? "";
    if (!logoRaw) return false;
    const logoNormalized = normalizePublicImageUrl(logoRaw);
    return raw.trim() === logoRaw || normalized === logoNormalized;
  } catch {
    return false;
  }
}

async function fetchImage(start: URL) {
  let current = start;

  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt += 1) {
    const response = await fetch(current.toString(), {
      redirect: "manual",
      headers: {
        accept: "image/avif,image/webp,image/apng,image/png,image/jpeg,image/gif,image/*,*/*;q=0.8",
        "user-agent": "VidoraAdsImageProxy/1.0"
      }
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || attempt === MAX_REDIRECTS) throw new Error("IMAGE_REDIRECT_FAILED");
      current = validateRemoteUrl(new URL(location, current).toString());
      continue;
    }

    return response;
  }

  throw new Error("IMAGE_REDIRECT_FAILED");
}

async function readLimitedBody(response: Response) {
  if (!response.body) throw new Error("IMAGE_BODY_MISSING");

  const declared = Number(response.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > MAX_BYTES) throw new Error("IMAGE_TOO_LARGE");

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_BYTES) throw new Error("IMAGE_TOO_LARGE");
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function bytesEqual(bytes: Uint8Array, values: number[], offset = 0) {
  return values.every((value, index) => bytes[offset + index] === value);
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

function sniffRasterType(bytes: Uint8Array) {
  if (bytes.length >= 8 && bytesEqual(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (bytes.length >= 3 && bytesEqual(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (bytes.length >= 6 && (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a")) return "image/gif";
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "image/webp";
  if (bytes.length >= 2 && ascii(bytes, 0, 2) === "BM") return "image/bmp";
  if (bytes.length >= 12 && ascii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(bytes, 8, 12))) return "image/avif";
  return null;
}

function safeRasterContentType(header: string, body: Uint8Array) {
  const type = header.split(";", 1)[0].trim().toLowerCase();
  const allowed = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/bmp"
  ]);

  if (allowed.has(type)) return type === "image/jpg" ? "image/jpeg" : type;
  return sniffRasterType(body);
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url");
  if (!raw) return NextResponse.json({ error: "missing_url" }, { status: 400 });

  try {
    const normalized = normalizePublicImageUrl(raw);
    if (!normalized) throw new Error("IMAGE_URL_INVALID");

    if (!(await isAuthorizedImageSource(raw, normalized))) {
      return NextResponse.json({ error: "image_source_not_allowed" }, { status: 403 });
    }

    const remote = validateRemoteUrl(normalized);
    const response = await fetchImage(remote);
    if (!response.ok) return NextResponse.json({ error: "image_unavailable" }, { status: 404 });

    const body = await readLimitedBody(response);
    const contentType = safeRasterContentType(response.headers.get("content-type") ?? "", body);
    if (!contentType) return NextResponse.json({ error: "unsupported_image_type" }, { status: 415 });

    return new Response(body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "content-length": String(body.byteLength),
        "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        "content-security-policy": "default-src 'none'; sandbox",
        "x-content-type-options": "nosniff"
      }
    });
  } catch (error) {
    console.error("Image proxy failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("TOO_LARGE") ? 413 : 422;
    return NextResponse.json({ error: "image_proxy_failed" }, { status });
  }
}
