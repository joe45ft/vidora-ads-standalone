# Vidora Ads Standalone

مشروع مستقل بالكامل لإدارة وعرض إعلانات الكورسات.

## Stack
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Cloudflare Workers
- Cloudflare D1
- Drizzle ORM
- Zod
- lucide-react icons

## الاستقلال عن Vidora الأصلي
هذا المشروع لا يستخدم قاعدة بيانات Vidora الأصلية ولا جلساته ولا ملفاته.
استخدم Worker منفصل وD1 منفصلة.

## 1) إنشاء قاعدة D1
```powershell
npx wrangler d1 create vidora-ads-standalone-db
```

انسخ `database_id` الناتج وضعه داخل `wrangler.jsonc`.

## 2) إعداد Secrets
```powershell
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
```

اختر كلمة مرور للإدارة، وSESSION_SECRET عشوائي قوي.

## 3) تثبيت الحزم
```powershell
npm install
```

## 4) تطبيق Migration محليًا
```powershell
npm run db:migrate:local
```

## 5) تطبيق Migration على Cloudflare
```powershell
npm run db:migrate:remote
```

## 6) النشر
```powershell
npm run cf:deploy
```

## الصفحات
- `/` صفحة الإعلانات العامة
- `/admin/login` دخول الأدمن
- `/admin` لوحة إدارة الإعلانات

## الصور
يدعم أي Public HTTPS Image URL مثل:
- Cloudflare R2
- AWS S3
- Cloudinary
- Firebase Storage
- Supabase Storage
- Google Cloud Storage
- Google Drive public file links
- Dropbox public links
- أي CDN عام

يتم تحويل Google Drive وDropbox تلقائيًا إلى شكل أنسب للعرض عند الحفظ.

## ملاحظات
- لا يتم تضمين أي Secret داخل المشروع.
- لا يتم تضمين node_modules.
- قاعدة البيانات اسمها `vidora-ads-standalone-db`.
- Worker اسمها `vidora-ads-standalone`.


## إذا ظهر:
`Cannot retry a build that was created with a seed_repo override`

لا تستخدم Retry لذلك الـBuild. أنشئ Build جديد بإحدى الطريقتين:

### من PowerShell
```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
.\Deploy-Standalone.ps1
```

### أو عند استخدام GitHub
ادفع Commit جديد:
```powershell
git add .
git commit --allow-empty -m "Trigger Cloudflare build"
git push
```

في Workers Builds، الـpush الجديد ينشئ Build جديدًا بدل Retry القديم.

## إعداد Git Build في Cloudflare
إذا ربطت المشروع بـ GitHub:
- Build command: `npm run cf:build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/` إذا كان المشروع في جذر الـrepository


## v1.0.2 - Cloudflare D1 TypeScript build fix

إذا ظهر أثناء `next build`:

```text
Cannot find name 'D1Database'
```

تم إصلاحه في v1.0.2 باستخدام الحزمة الرسمية:

```text
@cloudflare/workers-types
```

واستيراد:

```ts
import type { D1Database } from "@cloudflare/workers-types";
```

لذلك `npm run build` لا يحتاج إلى تشغيل `wrangler types` مسبقًا.

يمكن استخدام الأمر التالي اختياريًا لفحص/توليد Bindings Types محليًا:

```powershell
npm run cf:types
```
