# Cloudflare Workers Build Settings — Vidora Ads v1.2.0

Use these exact Git Build settings:

```text
Build command:
npx opennextjs-cloudflare build
```

```text
Deploy command:
npx opennextjs-cloudflare deploy
```

`package.json` intentionally keeps:

```json
"build": "next build"
```

OpenNext invokes the application's `build` script internally. Pointing `build` back to `opennextjs-cloudflare build` creates a recursive build loop.

## D1 binding

The Worker uses:

```text
Binding: DB
Database: vidora-ads-standalone-db
```

`wrangler.jsonc` must contain the real D1 `database_id`.

The application self-creates `advertisements` and `admin_settings` with `CREATE TABLE IF NOT EXISTS` when needed. Migration files remain included for normal database management, but a missing unapplied migration no longer causes the first request/save to fail when the D1 binding itself is valid.
