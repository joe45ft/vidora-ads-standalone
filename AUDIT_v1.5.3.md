# v1.5.3 Feature Completion Audit

Resolved items found in the v1.5.2 feature visibility audit:

1. Logo setting existed but homepage/header/footer did not use it — fixed.
2. Logo image proxy authorization was limited to ad images — fixed.
3. Category chips looked interactive but only jumped to #offers — fixed with a client event that selects the category.
4. Contact / Support hidden on mobile — fixed.
5. Course page bypassed CloudImage fallback — fixed.
6. Direct course page did not record a view — fixed.
7. Multiple Featured ads could be configured but only one was rendered — fixed, up to 3 are shown.
8. Support message could appear without a usable support link — fixed.
9. Logo URL validator accepted mailto/tel — fixed; logo requires HTTPS.
10. Admin brand name was hard-coded — fixed.
11. Logo preview missing in Admin Settings — added.
12. Clicks could outnumber views because CTA clicks could happen before card view tracking — client tracking now records view first and deduplicates one click per session.
13. Historical CTR can still contain legacy inconsistent data — display is clamped at 100%.

No destructive D1 changes.
