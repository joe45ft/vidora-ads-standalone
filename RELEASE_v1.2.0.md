# v1.2.0 — Stability, Save Fixes & Admin UX

## Advertisement save reliability

- Added automatic `advertisements` table initialization.
- Replaced generic save error with structured API errors.
- Added field-level validation messages.
- Fixed invalid default CTA value.
- Draft ads may be saved without CTA; published ads require a valid CTA.
- CTA domains without a scheme automatically receive `https://`.
- Added start/end date validation.
- Added original/offer price validation.
- Better image URL normalization and validation.

## Admin improvements

- Logout button.
- Manual refresh button.
- Status filter: Active / Draft / Scheduled / Expired / Archived.
- Better empty state.
- Toast notifications.
- Image preview.
- Loading states.
- Correct handling of expired admin sessions.
- Better duplicate/delete error handling.
- Removed emoji analytics indicators in favor of Lucide icons.

## Runtime/database improvements

- `advertisements` schema self-initializes when missing.
- Admin setup also initializes advertisement storage.
- D1 errors return useful API responses instead of being misreported as invalid input.
- Added application error boundary.

## Analytics fixes

- Views are now recorded when an ad is actually visible.
- One view per ad per browser session is recorded client-side.
- CTA navigation no longer waits for analytics requests.
- Analytics endpoint failures never block visitor navigation.

## Security / robustness

- Same-origin checks on state-changing admin routes.
- Timing-safe comparison for session signatures.
- Exact dependency versions pinned to the versions validated in Cloudflare build logs.

## Deployment

Cloudflare Workers Builds:

```text
Build:  npx opennextjs-cloudflare build
Deploy: npx opennextjs-cloudflare deploy
```

No destructive D1 migration is included.
