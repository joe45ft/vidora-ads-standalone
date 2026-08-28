CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  session_secret TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
