function withDefaultScheme(input: string) {
  const value = input.trim();
  if (!value) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
  return `https://${value}`;
}

function parseHttpUrl(input: string, errorCode: string) {
  try {
    const value = withDefaultScheme(input);
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(errorCode);
    return url;
  } catch {
    throw new Error(errorCode);
  }
}

export function normalizePublicImageUrl(input: string | null | undefined) {
  if (!input?.trim()) return null;

  const url = parseHttpUrl(input, "IMAGE_URL_INVALID");
  if (url.protocol !== "https:") throw new Error("IMAGE_URL_INVALID");

  if (url.hostname === "drive.google.com") {
    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    const id = fileMatch?.[1] ?? url.searchParams.get("id");
    if (id) return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}`;
  }

  if (url.hostname.endsWith("dropbox.com")) {
    url.searchParams.set("raw", "1");
    return url.toString();
  }

  return url.toString();
}

export function validatePublicActionUrl(
  input: string | null | undefined,
  options: { required?: boolean } = {}
) {
  const value = input?.trim() ?? "";
  if (!value) {
    if (options.required) throw new Error("CTA_URL_REQUIRED");
    return "";
  }

  return parseHttpUrl(value, "CTA_URL_INVALID").toString();
}
