# v1.1.1 — Automatic Admin Setup

## New
- Zero-manual-secret admin setup.
- `/admin` automatically redirects to `/admin/setup` on first run.
- Admin chooses only the password.
- Session secret is generated automatically.
- Password is stored as PBKDF2-SHA256 hash with random salt.
- Admin configuration is stored in D1.
- Setup page locks itself after successful first configuration.
- Login now reads credentials from D1.

## Compatibility
- Public UI unchanged from v1.1.0.
- Advertisement schema/API unchanged.
- Existing advertisements remain untouched.

## Database
Formal migration added: `0001_admin_settings.sql`.
The runtime also creates the admin settings table with `CREATE TABLE IF NOT EXISTS`, so first-run setup is self-initializing.
