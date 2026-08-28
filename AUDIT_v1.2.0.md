# Vidora Ads v1.2.0 — Stability Audit

## Problems found and fixed

1. Generic advertisement save failure hid the real server/validation error.
2. Default CTA value `https://` was not a valid URL.
3. Advertisement table depended on a migration being applied manually.
4. D1/runtime failures could be incorrectly reported as `invalid_input`.
5. Draft workflow unnecessarily required a finished CTA URL.
6. No field-level validation feedback in the Admin form.
7. No validation that offer end date is after start date.
8. No validation that original price is not below offer price.
9. Delete / duplicate / reload did not handle failed API responses consistently.
10. Expired admin sessions were not handled cleanly during CRUD operations.
11. No logout action in the Admin dashboard.
12. Analytics used emoji instead of the project's icon system.
13. View endpoint existed but public cards did not call it.
14. CTA navigation waited for click analytics and could be blocked by popup protection.
15. Analytics failures could surface as visitor-facing request failures.
16. Session signature comparison was ordinary string equality.
17. State-changing Admin requests had no same-origin guard.
18. Cloud image URL feedback was unclear.
19. Google Drive URL normalization handled only one common share form.
20. Public UI had no application-level friendly error boundary.
21. Dependency ranges allowed unplanned package upgrades on future Cloudflare builds.
22. Local artifact had a placeholder D1 database ID that could overwrite the working GitHub config.
23. Next.js 16 build was rewriting `jsx` in tsconfig during build.
24. “All offers” logic conditionally omitted the featured offer.

## Improvements added

- Self-initializing `advertisements` schema and indexes.
- Structured API error responses with field issues.
- Client-side + server-side validation.
- Toast success/error feedback.
- Loading states and refresh.
- Status filters.
- Image preview.
- Automatic `https://` for CTA domain-only input.
- Draft without CTA; CTA required for published ads.
- Better public image normalization.
- Session-expiry redirect.
- Logout.
- View tracking via IntersectionObserver.
- Non-blocking click analytics.
- Same-origin checks for Admin mutations.
- Timing-safe session signature comparison.
- Friendly app error boundary.
- Exact dependency pins matching the versions observed in successful Cloudflare builds.
- Real standalone D1 database ID preserved from the current GitHub repository.

## Validation performed

- 32 TypeScript/TSX files passed syntax/transpile parsing with TypeScript.
- package.json, tsconfig.json and wrangler.jsonc parsed successfully.
- ZIP integrity test passed.
- No node_modules, .next, .open-next, .env or local secret files are included.

A full Cloudflare build/deploy still needs to run in Cloudflare after pushing the release; this audit does not claim a production deploy before that CI run completes.
