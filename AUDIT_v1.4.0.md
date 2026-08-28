# Vidora Ads v1.4.0 — Admin Login & Security Audit

## Login fixes
- Supports current PBKDF2 hashes (100,000 iterations).
- Supports legacy PBKDF2 hashes (210,000 iterations).
- Legacy hashes are transparently upgraded after a successful login.
- Supports legacy session cookies during transition.
- Optional fallback to an existing Cloudflare `ADMIN_PASSWORD` secret; once verified it migrates into the D1 password format.
- Accidental outer whitespace is tried only as a compatibility fallback.
- Explicit session versioning and signed expiry timestamps.
- Password recovery/change rotates session credentials and invalidates old sessions.
- Failed-login throttling is stored per client source instead of globally.
- Clearer login errors.

## UX improvements
- Show/hide password.
- Caps Lock warning.
- Remember Me: 30-day session; normal session remains 12 hours.
- Forgot-password link.
- Recovery code shown after first setup.
- Existing installations missing a recovery code receive one after the next successful login.
- `/admin/recover`.
- `/admin/security`.
- Security button in Admin dashboard.
- Recovery code rotates after password reset/change.

## D1 self-upgrade
`admin_settings` automatically adds missing authentication columns.
A separate `admin_login_attempts` table is created automatically for source-scoped throttling.

No advertisements are deleted or rewritten.

## Validation performed
- TS/TSX files parsed with the TypeScript compiler parser and checked for syntax diagnostics.
- JSON configuration files parsed successfully.
- Build script remains `next build`.
- Existing D1 binding/id is preserved.
- ZIP integrity is verified before delivery.

Production Cloudflare CI/deploy still needs to run after the GitHub push.
