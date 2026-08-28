# v1.1.2 — Cloudflare Auto Admin Setup Fix

## Fixed
- Reduced PBKDF2 iterations from 210,000 to 100,000 for Cloudflare Worker compatibility.
- Added runtime error logging for first admin setup.
- Added clearer setup errors:
  - D1 unavailable
  - cryptographic setup failure
  - already configured
  - generic runtime failure

## Preserved
- Automatic first-run `/admin/setup`
- Automatic session secret generation
- D1-stored admin settings
- Public UI v1.1
- Advertisement Admin/API/D1 model
- OpenNext build configuration

No destructive database changes.
