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
);
