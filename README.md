# Vidora Ads Standalone v1.2.0

منصة مستقلة لعرض وإدارة إعلانات الكورسات على Cloudflare Workers + D1.

## Stack

- Next.js 16.3.3
- React 19.2.8
- TypeScript 5.9.3
- OpenNext for Cloudflare 1.20.4
- Cloudflare Workers
- Cloudflare D1
- Drizzle ORM
- Zod
- Tailwind CSS
- Lucide React icons

## الصفحات

- `/` — واجهة العروض العامة.
- `/admin` — لوحة إدارة الإعلانات.
- `/admin/setup` — إعداد الأدمن لأول مرة فقط.
- `/admin/login` — تسجيل الدخول بعد الإعداد.

## الإدارة التلقائية

لا تحتاج إلى `ADMIN_PASSWORD` أو `SESSION_SECRET` في Cloudflare.

في أول زيارة إلى `/admin`:

1. يتم تحويلك إلى `/admin/setup`.
2. تختار كلمة مرور الأدمن فقط.
3. النظام ينشئ Salt ومفتاح Session عشوائيًا.
4. كلمة المرور تحفظ كـ PBKDF2-SHA256 hash داخل D1.
5. جداول الإدارة والإعلانات يتم إنشاؤها تلقائيًا إذا كانت غير موجودة.

## D1

Binding المستخدم في الكود:

```text
DB
```

Database:

```text
vidora-ads-standalone-db
```

الجداول الأساسية:

- `advertisements`
- `admin_settings`

المشروع أصبح Self-initializing، لذلك عدم تطبيق migration يدويًا لا يمنع أول تشغيل طالما Binding `DB` صحيح.

## Cloudflare Git Build

استخدم الإعدادات التالية في Cloudflare Workers Builds:

```text
Build command:
npx opennextjs-cloudflare build
```

```text
Deploy command:
npx opennextjs-cloudflare deploy
```

داخل `package.json` يجب أن يظل:

```json
"build": "next build"
```

لأن OpenNext يشغّل `next build` داخليًا. جعل `build` يشير إلى OpenNext نفسه يسبب Recursive Build.

## إصلاحات v1.2.0

- إصلاح حفظ الإعلانات وإظهار سبب الخطأ الحقيقي.
- إنشاء جدول `advertisements` تلقائيًا عند الحاجة.
- التحقق من الجلسة أثناء الحفظ والحذف والنسخ والتحديث.
- رسائل Validation لكل حقل بدل رسالة عامة.
- إصلاح رابط CTA الافتراضي غير الصالح `https://`.
- السماح بحفظ Draft بدون CTA، مع إلزام CTA عند النشر.
- إضافة `https://` تلقائيًا لرابط CTA إذا تم إدخال domain فقط.
- دعم أفضل لروابط Google Drive وDropbox للصور.
- التحقق من ترتيب بداية ونهاية العرض.
- التحقق من الأسعار.
- إضافة Logout وRefresh وفلاتر للحالات في لوحة الإدارة.
- استبدال Emoji analytics بأيقونات SVG.
- إصلاح View tracking ليعمل عند ظهور الإعلان للمستخدم.
- إصلاح Click tracking بحيث لا يمنع فتح رابط التسجيل.
- Analytics failures لا تكسر تجربة الزائر.
- حماية أفضل لطلبات Admin ضد Cross-Origin requests.
- Timing-safe comparison لتوقيع Session.
- Error Boundary بدل صفحة Server Error الخام.
- تثبيت إصدارات الحزم التي نجحت في Cloudflare لتقليل أخطاء تحديث dependencies مستقبلًا.

## الصور

يمكن استخدام Public HTTPS image URLs من خدمات مثل:

- Cloudflare R2
- AWS S3
- Cloudinary
- Firebase Storage
- Supabase Storage
- Google Cloud Storage
- Google Drive public links
- Dropbox public links
- أي CDN عام

## ملاحظات مهمة

- لا توجد كلمات مرور أو Session secrets داخل GitHub.
- D1 database ID ليس Secret، ويجب أن يكون موجودًا في `wrangler.jsonc` حتى يعمل الـbinding.
- بيانات الإعلانات الحالية لا يتم حذفها عند التحديث إلى v1.2.0.


## v1.3.0 — Images and Ad Types

- Cloud images now use a protected image proxy with direct-source fallback.
- Supported common share links include Google Drive, Dropbox, OneDrive/SharePoint and GitHub, plus generic public HTTPS cloud storage.
- Advertisement type can be **Available Course** or **Discount Offer**.
- No manual D1 migration is required; older databases receive `ad_type` automatically.
- Cloud files must be public/readable without login.
