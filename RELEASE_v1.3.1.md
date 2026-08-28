# v1.3.1 — Admin Password Compatibility Fix

## Fixed
Earlier automatic-admin releases used two PBKDF2 configurations:
- v1.1.1: 210,000 iterations
- later releases: 100,000 iterations

Old `admin_settings` rows did not store which iteration count created the password hash.
That meant a correct password created by the older release could be reported as incorrect
after upgrading the application.

v1.3.1 fixes this without deleting D1 data:
- Adds a nullable `password_iterations` column automatically at runtime.
- New passwords are stored with their iteration count.
- Legacy rows automatically try the current and legacy hash formats.
- After a successful legacy login, the hash is transparently upgraded to the current format.
- Advertisements and the existing session secret are preserved.
- No admin reset and no D1 data deletion are performed.

No manual migration is required.
