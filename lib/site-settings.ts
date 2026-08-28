import { getEnv } from "@/lib/cloudflare";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  supportLabel: string;
  supportUrl: string | null;
  supportText: string;
  footerText: string;
};

const DEFAULTS: SiteSettings = {
  siteName: "VIDORA ADS",
  tagline: "Course Marketplace",
  logoUrl: null,
  supportLabel: "Contact / Support",
  supportUrl: null,
  supportText: "تواصل معنا للاستفسار أو الدعم.",
  footerText: "© 2026 Vidora Ads. All rights reserved."
};

type SiteSettingsRow = {
  id: number;
  site_name: string;
  tagline: string;
  logo_url: string | null;
  support_label: string;
  support_url: string | null;
  support_text: string;
  footer_text: string;
  updated_at: number;
};

export async function ensureSiteSettingsTable() {
  await getEnv().DB.prepare(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY NOT NULL,
      site_name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      logo_url TEXT,
      support_label TEXT NOT NULL,
      support_url TEXT,
      support_text TEXT NOT NULL,
      footer_text TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();

  await getEnv().DB.prepare(`
    INSERT OR IGNORE INTO site_settings (
      id, site_name, tagline, logo_url,
      support_label, support_url, support_text,
      footer_text, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    1,
    DEFAULTS.siteName,
    DEFAULTS.tagline,
    DEFAULTS.logoUrl,
    DEFAULTS.supportLabel,
    DEFAULTS.supportUrl,
    DEFAULTS.supportText,
    DEFAULTS.footerText,
    Date.now()
  ).run();
}

function fromRow(row: SiteSettingsRow): SiteSettings {
  return {
    siteName: row.site_name,
    tagline: row.tagline,
    logoUrl: row.logo_url,
    supportLabel: row.support_label,
    supportUrl: row.support_url,
    supportText: row.support_text,
    footerText: row.footer_text
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  await ensureSiteSettingsTable();
  const row = await getEnv().DB
    .prepare("SELECT * FROM site_settings WHERE id = 1 LIMIT 1")
    .first<SiteSettingsRow>();

  return row ? fromRow(row) : DEFAULTS;
}

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function optionalLogoUrl(value: unknown) {
  const raw = clean(value, 1000);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") throw new Error("unsupported_protocol");
    return raw;
  } catch {
    throw new Error("INVALID_LOGO_URL");
  }
}

function optionalSupportUrl(value: unknown) {
  const raw = clean(value, 1000);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (!["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
      throw new Error("unsupported_protocol");
    }
    return raw;
  } catch {
    throw new Error("INVALID_SUPPORT_URL");
  }
}

export async function updateSiteSettings(input: unknown) {
  const body = (input ?? {}) as Record<string, unknown>;

  const siteName = clean(body.siteName, 80) || DEFAULTS.siteName;
  const tagline = clean(body.tagline, 160) || DEFAULTS.tagline;
  const logoUrl = optionalLogoUrl(body.logoUrl);
  const supportLabel = clean(body.supportLabel, 60) || DEFAULTS.supportLabel;
  const supportUrl = optionalSupportUrl(body.supportUrl);
  const supportText = clean(body.supportText, 300) || DEFAULTS.supportText;
  const footerText = clean(body.footerText, 200) || DEFAULTS.footerText;

  await ensureSiteSettingsTable();

  await getEnv().DB.prepare(`
    UPDATE site_settings
    SET
      site_name = ?,
      tagline = ?,
      logo_url = ?,
      support_label = ?,
      support_url = ?,
      support_text = ?,
      footer_text = ?,
      updated_at = ?
    WHERE id = 1
  `).bind(
    siteName,
    tagline,
    logoUrl,
    supportLabel,
    supportUrl,
    supportText,
    footerText,
    Date.now()
  ).run();

  return getSiteSettings();
}
