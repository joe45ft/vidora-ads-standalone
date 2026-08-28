# Vidora Ads v1.3.0 — Audit

## User-visible issues addressed
1. Cloud image links could save successfully but fail to render in browsers.
2. Google Drive share pages were not consistently direct image resources.
3. Admin image preview did not use the same rendering path as the public website.
4. The project treated every advertisement like a discount offer.
5. Admin field labels forced `offer price` wording even for normal courses.
6. Public cards had no explicit `available course` mode.
7. Public search could not filter between courses and discounts.
8. Existing discounted records needed a safe upgrade path.

## Additional fixes / hardening
9. Added a capped image proxy with redirect validation.
10. Blocked SVG/HTML/active content from the same-origin image proxy.
11. Blocked arbitrary public use of the proxy for unsaved external URLs.
12. Added proxy-to-direct-to-placeholder image fallback.
13. Added support helpers for Dropbox, OneDrive, SharePoint and GitHub image links.
14. Analytics increments now ignore draft, archived, scheduled-future and expired ads.
15. Normal course save clears stale `original_price` values.
16. Offer validation requires a real discount.
17. D1 older schema auto-upgrades with `ad_type` without deleting rows.
18. Old records with a real price difference are auto-classified as offers.
19. Admin list now labels and filters ad types.
20. Public cards show `مجاني` when current course price is zero.

## Validation performed
- TypeScript/TSX syntax transpile check: 34 source files, 0 syntax errors.
- All local `@/` imports resolve to files in the package.
- Old SQLite schema upgrade scenario tested with existing discounted and non-discounted rows.
- Fresh SQLite schema scenario tested with `ad_type` present.
- URL normalization tested for Google Drive, Dropbox, OneDrive, GitHub and generic HTTPS CDN URLs.
- Existing real D1 ID remains in `wrangler.jsonc`.
- Build script remains `next build` to avoid the previous recursive OpenNext build issue.

## Deployment validation note
A full OpenNext production build was not executed in this local artifact environment because dependency installation timed out. Cloudflare CI remains the authoritative final build/deploy test after pushing the release to GitHub.
