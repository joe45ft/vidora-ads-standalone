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
    if (!["http:", "https:"].includes(url.protocol)) throw new Error(errorCode);
    return url;
  } catch {
    throw new Error(errorCode);
  }
}

function googleDriveId(url: URL) {
  const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
  const directMatch = url.pathname.match(/\/d\/([^/=]+)/);
  return fileMatch?.[1] ?? directMatch?.[1] ?? url.searchParams.get("id");
}

export function normalizePublicImageUrl(input: string | null | undefined) {
  if (!input?.trim()) return null;

  const url = parseHttpUrl(input, "IMAGE_URL_INVALID");
  if (url.protocol !== "https:") throw new Error("IMAGE_URL_INVALID");

  if (
    url.hostname === "drive.google.com" ||
    url.hostname === "drive.usercontent.google.com" ||
    url.hostname.endsWith("googleusercontent.com")
  ) {
    const id = googleDriveId(url);
    if (id) return `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w2000`;
  }

  if (url.hostname === "www.dropbox.com" || url.hostname === "dropbox.com") {
    url.hostname = "dl.dropboxusercontent.com";
    url.searchParams.delete("dl");
    url.searchParams.delete("raw");
    return url.toString();
  }

  if (url.hostname === "1drv.ms" || url.hostname.endsWith("onedrive.live.com") || url.hostname.endsWith("sharepoint.com")) {
    url.searchParams.set("download", "1");
    return url.toString();
  }

  if (url.hostname === "github.com") {
    const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
    if (match) {
      const [, owner, repo, branch, filePath] = match;
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    }
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
