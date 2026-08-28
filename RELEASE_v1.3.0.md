# v1.3.0 — Cloud Images + Course / Offer Modes

## Image fixes
- Added a same-origin image proxy for cloud-hosted advertisement images.
- Proxy follows a limited number of HTTPS redirects.
- Proxy rejects localhost, private-style hostnames and literal IP targets.
- Proxy accepts only safe raster image formats and caps images at 15 MB.
- Public proxy use is limited to image URLs saved in advertisements; an authenticated admin can preview a new URL before saving.
- Google Drive share links are converted to Googleusercontent image URLs.
- Dropbox share links are converted to direct download hosts.
- OneDrive / SharePoint links get direct-download mode.
- GitHub `blob` links are converted to `raw.githubusercontent.com`.
- Cloudinary, Cloudflare R2, S3, Firebase Storage, Supabase Storage and other public HTTPS image URLs continue to work generically.
- Frontend image component tries the proxy first, then the direct source, then a clean fallback.
- Admin image preview uses the same image pipeline as production cards.

Important: a cloud file must be publicly readable. Private Drive/Dropbox/OneDrive files cannot be displayed without provider authentication.

## New advertisement modes
- `course`: normal available course without a fake discount.
- `offer`: discounted offer with an original price and a lower offer price.
- Existing records with `original_price > offer_price` are automatically recognized as offers.
- Existing records without a discount become normal available courses.
- Free courses display `مجاني`.
- Public cards display either `كورس متاح` or a calculated discount badge.
- Public filters include: all, available courses, discount offers.
- Admin filters include advertisement type.

## Validation / reliability
- Discount offers require an original price greater than the offer price.
- Normal courses automatically clear `original_price` when saved.
- Publish scheduling labels are now generic instead of offer-only wording.
- Analytics updates only apply to advertisements that are currently public.
- D1 schema upgrades itself by adding `ad_type` when an older database is detected.
- No manual D1 migration is required for this release.

## Preserved
- Existing advertisements and analytics.
- Automatic Admin setup.
- D1 binding and current database ID.
- OpenNext / Cloudflare deployment configuration.
