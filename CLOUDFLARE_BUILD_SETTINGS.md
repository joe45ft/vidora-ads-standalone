# Cloudflare Workers Build Settings

Use these exact settings.

## Production branch

Build command:

```text
npx opennextjs-cloudflare build
```

Deploy command:

```text
npx opennextjs-cloudflare deploy
```

Do NOT set the Cloudflare build command to `npm run build` for the adapter step.
`package.json` intentionally keeps:

```json
"build": "next build"
```

because OpenNext invokes that script internally to build the Next.js application.

## Important

Do not change:

```json
"build": "next build"
```

to:

```json
"build": "opennextjs-cloudflare build"
```

That creates recursive builds:

```text
OpenNext build
 -> package build
 -> OpenNext build
 -> package build
 -> ...
```

## D1

Cloudflare Workers Builds do not automatically apply the SQL migration just because the Worker deploys.

After creating the D1 database and putting its real ID in `wrangler.jsonc`, apply:

```powershell
npx wrangler d1 migrations apply vidora-ads-standalone-db --remote
```

before using the application in production.
