# v1.5.1 — Course Page Build & Image Fix

## Build fix
`getPublicAdBySlug()` was originally added using two helpers that do not exist in the current Drizzle-based ads service:
- `getEnv`
- `mapAdRow`

It now uses the same existing `getDb()` + Drizzle query pattern as the rest of `lib/ads.ts`.

## Runtime fix
The new course page referenced `/api/image-proxy`, but the project image proxy route is `/api/image`.
All course-page image URLs now use the real endpoint.

## Preserved
- Existing D1 database and advertisements.
- Admin authentication.
- General site settings.
- Contact / Support.
- Dedicated course pages.
- OpenNext build configuration.
