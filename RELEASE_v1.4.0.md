# v1.4.0 — Admin Login & Recovery Upgrade

This release focuses on a reliable, self-healing Admin authentication flow.

## Compatibility fixes
- Current 100k PBKDF2 passwords.
- Legacy 210k PBKDF2 passwords.
- Automatic legacy hash upgrade after successful login.
- Legacy session-cookie compatibility.
- Optional legacy `ADMIN_PASSWORD` Cloudflare secret fallback and automatic migration to D1.

## Login UX
- Show/hide password.
- Caps Lock warning.
- Remember Me.
- Better loading/error states.
- Forgot-password flow.
- Recovery code generated at setup.
- Existing admins without a recovery code receive one after their next successful login.

## Recovery and Security
- `/admin/recover`
- `/admin/security`
- Password reset using recovery code.
- Password change while authenticated.
- Recovery code rotates after reset/change.
- Password reset/change invalidates old sessions.
- Failed-login throttling is scoped per client source so an attacker cannot globally lock the Admin account.

## Database
Authentication tables/columns self-upgrade at runtime. No destructive migration is required and existing advertisements remain unchanged.
