# v1.4.1 — Cloudflare Build Fix

## Fixed
Cloudflare/Turbopack failed because `lib/admin-settings.ts` contained duplicate top-level helper declarations:

- `ensureLoginAttemptsTable`
- `attemptKey`

The duplicate block has been removed.

## Validation added
This release also checks:
- TypeScript/TSX parse diagnostics.
- Duplicate top-level function declarations in every TS/TSX source file.
- JSON configuration parsing.
- Safe `next build` package script.
- Existing D1 binding preservation.
- ZIP integrity.

No D1 data, advertisements, passwords, recovery codes, or sessions are intentionally reset by this release.
