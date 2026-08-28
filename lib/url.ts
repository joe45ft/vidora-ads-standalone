import { z } from "zod";

const httpsUrlSchema = z.string().url().refine((value) => value.startsWith("https://"), {
  message: "الرابط يجب أن يبدأ بـ https://"
});

export function normalizePublicImageUrl(input: string | null | undefined) {
  if (!input?.trim()) return null;
  const value = httpsUrlSchema.parse(input.trim());

  try {
    const url = new URL(value);

    if (url.hostname === "drive.google.com") {
      const match = url.pathname.match(/\/file\/d\/([^/]+)/);
      if (match?.[1]) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    if (url.hostname.endsWith("dropbox.com")) {
      url.searchParams.set("raw", "1");
      return url.toString();
    }

    return value;
  } catch {
    return value;
  }
}

export function validatePublicActionUrl(input: string) {
  const value = z.string().url().parse(input.trim());
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol)) {
    throw new Error("Invalid CTA URL protocol");
  }
  return value;
}
