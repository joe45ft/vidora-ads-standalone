"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  BadgePercent,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  Loader2,
  LogOut,
  MousePointerClick,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Settings2,
  Star,
  Trash2,
  X
} from "lucide-react";
import { CloudImage } from "@/components/cloud-image";

type Ad = {
  id: string;
  title: string;
  slug: string;
  courseName: string;
  category: string;
  headline: string | null;
  description: string | null;
  imageUrl: string | null;
  adType: "course" | "offer";
  originalPrice: number | null;
  offerPrice: number;
  ctaText: string;
  ctaUrl: string;
  featured: boolean;
  published: boolean;
  archived: boolean;
  startsAt: string | Date | null;
  endsAt: string | Date | null;
  views: number;
  clicks: number;
};

type FormState = {
  id?: string;
  title: string;
  courseName: string;
  category: string;
  headline: string;
  description: string;
  imageUrl: string;
  adType: "course" | "offer";
  originalPrice: string;
  offerPrice: string;
  ctaText: string;
  ctaUrl: string;
  featured: boolean;
  published: boolean;
  archived: boolean;
  startsAt: string;
  endsAt: string;
};

type ApiIssue = { field: string; message: string };
type ApiPayload = {
  ok?: boolean;
  error?: string;
  message?: string;
  issues?: ApiIssue[];
};

type Toast = { type: "success" | "error"; text: string } | null;

type StatusKey = "all" | "Active" | "Draft" | "Scheduled" | "Expired" | "Archived";
type AdTypeFilter = "all" | "course" | "offer";

const emptyForm: FormState = {
  title: "",
  courseName: "",
  category: "General",
  headline: "",
  description: "",
  imageUrl: "",
  adType: "course",
  originalPrice: "",
  offerPrice: "",
  ctaText: "سجل الآن",
  ctaUrl: "",
  featured: false,
  published: true,
  archived: false,
  startsAt: "",
  endsAt: ""
};

function toLocalInput(value: string | Date | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function status(ad: Ad) {
  if (ad.archived) return "Archived" as const;
  if (!ad.published) return "Draft" as const;
  const now = Date.now();
  if (ad.startsAt && new Date(ad.startsAt).getTime() > now) return "Scheduled" as const;
  if (ad.endsAt && new Date(ad.endsAt).getTime() < now) return "Expired" as const;
  return "Active" as const;
}

function statusLabel(value: ReturnType<typeof status>) {
  return {
    Active: "نشط",
    Draft: "مسودة",
    Scheduled: "مجدول",
    Expired: "منتهي",
    Archived: "مؤرشف"
  }[value];
}

function validateForm(form: FormState) {
  const errors: Record<string, string> = {};
  if (form.title.trim().length < 2) errors.title = "اسم الإعلان مطلوب.";
  if (form.courseName.trim().length < 2) errors.courseName = "اسم الكورس مطلوب.";
  if (form.category.trim().length < 2) errors.category = "التصنيف مطلوب.";

  const currentPrice = Number(form.offerPrice);
  if (!form.offerPrice.trim()) errors.offerPrice = form.adType === "offer" ? "سعر العرض مطلوب." : "سعر الكورس مطلوب.";
  else if (!Number.isInteger(currentPrice) || currentPrice < 0) errors.offerPrice = "أدخل سعرًا صحيحًا بدون كسور.";

  if (form.adType === "offer") {
    if (!form.originalPrice.trim()) {
      errors.originalPrice = "السعر الأصلي مطلوب لعرض الخصم.";
    } else {
      const original = Number(form.originalPrice);
      if (!Number.isInteger(original) || original < 0) errors.originalPrice = "أدخل سعرًا صحيحًا بدون كسور.";
      else if (Number.isFinite(currentPrice) && original <= currentPrice) errors.originalPrice = "السعر الأصلي يجب أن يكون أكبر من سعر العرض.";
    }
  }

  if (!form.ctaText.trim()) errors.ctaText = "نص الزر مطلوب.";
  if (form.published && !form.archived && !form.ctaUrl.trim()) {
    errors.ctaUrl = "رابط التسجيل مطلوب عند نشر الإعلان.";
  }

  if (form.imageUrl.trim() && !/^https:\/\//i.test(form.imageUrl.trim()) && !/^[\w.-]+\.[a-z]{2,}/i.test(form.imageUrl.trim())) {
    errors.imageUrl = "استخدم رابط HTTPS عام للصورة.";
  }

  if (form.startsAt && form.endsAt) {
    if (new Date(form.endsAt).getTime() <= new Date(form.startsAt).getTime()) {
      errors.endsAt = "نهاية العرض يجب أن تكون بعد البداية.";
    }
  }

  return errors;
}

async function readPayload(response: Response): Promise<ApiPayload> {
  return response.json().catch(() => ({}));
}

export function AdminDashboard({ initialAds, siteName }: { initialAds: Ad[]; siteName: string }) {
  const [ads, setAds] = useState(initialAds);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusKey>("all");
  const [typeFilter, setTypeFilter] = useState<AdTypeFilter>("all");
  const [editing, setEditing] = useState<FormState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ads.filter((ad) => {
      const textMatch = `${ad.title} ${ad.courseName} ${ad.category}`.toLowerCase().includes(q);
      const statusMatch = filter === "all" || status(ad) === filter;
      const typeMatch = typeFilter === "all" || ad.adType === typeFilter;
      return textMatch && statusMatch && typeMatch;
    });
  }, [ads, query, filter, typeFilter]);

  const metrics = useMemo(() => ({
    active: ads.filter((ad) => status(ad) === "Active").length,
    views: ads.reduce((sum, ad) => sum + ad.views, 0),
    clicks: ads.reduce((sum, ad) => sum + ad.clicks, 0)
  }), [ads]);

  function showToast(type: "success" | "error", text: string) {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 4500);
  }

  function edit(ad?: Ad) {
    setFieldErrors({});
    if (!ad) {
      setEditing({ ...emptyForm });
      return;
    }

    setEditing({
      id: ad.id,
      title: ad.title,
      courseName: ad.courseName,
      category: ad.category,
      headline: ad.headline ?? "",
      description: ad.description ?? "",
      imageUrl: ad.imageUrl ?? "",
      adType: ad.adType ?? (ad.originalPrice != null && ad.originalPrice > ad.offerPrice ? "offer" : "course"),
      originalPrice: ad.originalPrice?.toString() ?? "",
      offerPrice: ad.offerPrice.toString(),
      ctaText: ad.ctaText,
      ctaUrl: ad.ctaUrl,
      featured: ad.featured,
      published: ad.published,
      archived: ad.archived,
      startsAt: toLocalInput(ad.startsAt),
      endsAt: toLocalInput(ad.endsAt)
    });
  }

  async function reload(showSuccess = false) {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ads", { cache: "no-store" });
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        const data = await readPayload(response);
        throw new Error(data.message || "تعذر تحميل الإعلانات.");
      }

      setAds(await response.json());
      if (showSuccess) showToast("success", "تم تحديث البيانات.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "تعذر تحميل الإعلانات.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!editing || busy) return;

    const localErrors = validateForm(editing);
    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      showToast("error", "راجع الحقول المحددة قبل الحفظ.");
      return;
    }

    setFieldErrors({});
    setBusy(true);

    const payload = {
      title: editing.title.trim(),
      courseName: editing.courseName.trim(),
      category: editing.category.trim(),
      headline: editing.headline.trim() || null,
      description: editing.description.trim() || null,
      imageUrl: editing.imageUrl.trim() || null,
      adType: editing.adType,
      originalPrice: editing.adType === "offer" && editing.originalPrice.trim() ? Number(editing.originalPrice) : null,
      offerPrice: Number(editing.offerPrice),
      ctaText: editing.ctaText.trim(),
      ctaUrl: editing.ctaUrl.trim(),
      featured: editing.featured,
      published: editing.published,
      archived: editing.archived,
      startsAt: editing.startsAt ? new Date(editing.startsAt).toISOString() : null,
      endsAt: editing.endsAt ? new Date(editing.endsAt).toISOString() : null
    };

    try {
      const response = await fetch(editing.id ? `/api/admin/ads/${editing.id}` : "/api/admin/ads", {
        method: editing.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await readPayload(response);

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        if (data.issues?.length) {
          setFieldErrors(Object.fromEntries(data.issues.map((issue) => [issue.field, issue.message])));
        }
        throw new Error(data.message || "تعذر حفظ الإعلان.");
      }

      setEditing(null);
      await reload();
      showToast("success", editing.id ? "تم تحديث الإعلان بنجاح." : "تم إنشاء الإعلان بنجاح.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "تعذر حفظ الإعلان.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("هل تريد حذف هذا الإعلان نهائيًا؟")) return;

    try {
      const response = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
      const data = await readPayload(response);
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!response.ok) throw new Error(data.message || "تعذر حذف الإعلان.");
      await reload();
      showToast("success", "تم حذف الإعلان.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "تعذر حذف الإعلان.");
    }
  }

  async function duplicate(id: string) {
    try {
      const response = await fetch(`/api/admin/ads/${id}/duplicate`, { method: "POST" });
      const data = await readPayload(response);
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!response.ok) throw new Error(data.message || "تعذر نسخ الإعلان.");
      await reload();
      showToast("success", "تم إنشاء نسخة كمسودة.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "تعذر نسخ الإعلان.");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen">
      {toast && (
        <div className="fixed left-1/2 top-5 z-[80] w-[min(92vw,520px)] -translate-x-1/2">
          <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${toast.type === "success" ? "border-emerald-400/20 bg-emerald-950/90 text-emerald-100" : "border-rose-400/20 bg-rose-950/90 text-rose-100"}`}>
            {toast.type === "success" ? <CheckCircle2 className="mt-0.5 shrink-0" size={19} /> : <AlertCircle className="mt-0.5 shrink-0" size={19} />}
            <div className="flex-1 text-sm font-bold leading-6">{toast.text}</div>
            <button onClick={() => setToast(null)} aria-label="إغلاق"><X size={17} /></button>
          </div>
        </div>
      )}

      <header className="border-b border-white/10 bg-[#070b14]/85 px-5 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-widest text-violet-400">{siteName}</div>
            <h1 className="text-2xl font-black">إدارة الإعلانات</h1>
            <p className="mt-1 text-xs text-slate-500">إدارة الكورسات والعروض والنشر والإحصائيات.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => void reload(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/[0.04] disabled:opacity-50">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> تحديث
            </button>
            <button onClick={() => edit()} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold hover:bg-violet-500">
              <Plus size={17} /> إضافة إعلان
            </button>
            <button onClick={() => { window.location.href = "/admin/settings"; }} className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-300 hover:bg-violet-500/15">
              <Settings2 size={16} /> إعدادات الموقع
            </button>
            <button onClick={() => { window.location.href = "/admin/security"; }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/[0.04]">
              <ShieldCheck size={16} /> الأمان
            </button>
            <button onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-slate-400 hover:bg-white/[0.04] hover:text-white">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          <Metric icon={<Eye />} label="إعلانات نشطة" value={metrics.active} />
          <Metric icon={<BarChart3 />} label="المشاهدات" value={metrics.views.toLocaleString()} />
          <Metric icon={<MousePointerClick />} label="النقرات" value={metrics.clicks.toLocaleString()} />
        </section>

        <section className="mt-5 rounded-3xl border border-violet-400/15 bg-violet-500/[0.05] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-violet-300">
                <Settings2 size={17} />
                إعدادات الموقع
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                غيّر اسم الموقع، الشعار، زر Contact / Support، ورسالة الدعم والفوتر من مكان واحد.
              </p>
            </div>

            <button
              onClick={() => { window.location.href = "/admin/settings"; }}
              className="shrink-0 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black hover:bg-violet-500"
            >
              فتح الإعدادات
            </button>
          </div>
        </section>

        <section className="mt-7 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-black">كل الإعلانات</h2>
              <p className="text-sm text-slate-500">{ads.length} إعلان محفوظ.</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select value={filter} onChange={(e) => setFilter(e.target.value as StatusKey)} className="rounded-xl border border-white/10 bg-[#0a101c] px-3 py-2.5 text-sm outline-none">
                <option value="all">كل الحالات</option>
                <option value="Active">نشط</option>
                <option value="Draft">مسودة</option>
                <option value="Scheduled">مجدول</option>
                <option value="Expired">منتهي</option>
                <option value="Archived">مؤرشف</option>
              </select>

              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as AdTypeFilter)} className="rounded-xl border border-white/10 bg-[#0a101c] px-3 py-2.5 text-sm outline-none">
                <option value="all">كل الأنواع</option>
                <option value="course">كورسات متاحة</option>
                <option value="offer">عروض خصم</option>
              </select>

              <label className="flex min-w-[260px] items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <Search size={17} className="text-slate-500" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن إعلان أو كورس..." className="w-full bg-transparent outline-none" />
              </label>
            </div>
          </div>

          {filtered.length ? (
            <div className="grid gap-3">
              {filtered.map((ad) => (
                <article key={ad.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 md:grid-cols-[100px_1fr_auto] md:items-center">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-900">
                    <CloudImage
                      src={ad.imageUrl}
                      alt={ad.courseName}
                      className="h-full w-full object-cover"
                      fallbackClassName="grid h-full place-items-center bg-slate-900 text-white/20"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{ad.courseName}</h3>
                      {ad.featured && <Star size={15} className="text-amber-300" fill="currentColor" />}
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">{statusLabel(status(ad))}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${ad.adType === "offer" ? "bg-emerald-500/10 text-emerald-300" : "bg-cyan-500/10 text-cyan-300"}`}>
                        {ad.adType === "offer" ? <BadgePercent size={12} /> : <BookOpenCheck size={12} />}
                        {ad.adType === "offer" ? "عرض خصم" : "كورس متاح"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{ad.title} • {ad.category}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1"><Eye size={13} /> {ad.views}</span>
                      <span className="inline-flex items-center gap-1"><MousePointerClick size={13} /> {ad.clicks}</span>
                      <span>CTR {ad.views ? Math.min(100, (ad.clicks / ad.views) * 100).toFixed(1) : "0.0"}%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Action icon={<Edit3 size={15} />} onClick={() => edit(ad)}>تعديل</Action>
                    <Action icon={<Copy size={15} />} onClick={() => void duplicate(ad.id)}>نسخ</Action>
                    <Action danger icon={<Trash2 size={15} />} onClick={() => void remove(ad.id)}>حذف</Action>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-300"><Archive size={21} /></div>
              <h3 className="mt-4 font-black">لا توجد إعلانات مطابقة</h3>
              <p className="mt-2 text-sm text-slate-500">أضف إعلانًا جديدًا أو غيّر البحث والفلاتر.</p>
            </div>
          )}
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0d1322] p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold tracking-widest text-violet-400">ADVERTISEMENT</div>
                <h2 className="text-2xl font-black">{editing.id ? "تعديل الإعلان" : "إضافة إعلان"}</h2>
                <p className="mt-1 text-xs text-slate-500">الحقول بعلامة * مطلوبة.</p>
              </div>
              <button onClick={() => setEditing(null)} disabled={busy} className="grid size-10 place-items-center rounded-xl border border-white/10 hover:bg-white/[0.04] disabled:opacity-50" aria-label="إغلاق"><X /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field required label="اسم الإعلان" error={fieldErrors.title}>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="مثال: عرض الصيف" />
              </Field>
              <Field required label="اسم الكورس" error={fieldErrors.courseName}>
                <input value={editing.courseName} onChange={(e) => setEditing({ ...editing, courseName: e.target.value })} placeholder="اسم الكورس" />
              </Field>
              <Field required label="نوع الإعلان" error={fieldErrors.adType} hint="اختر كورس متاح بدون خصم أو عرض بسعر مخفض.">
                <select
                  value={editing.adType}
                  onChange={(e) => {
                    const adType = e.target.value as "course" | "offer";
                    setEditing({ ...editing, adType, originalPrice: adType === "course" ? "" : editing.originalPrice });
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 outline-none focus:border-violet-400/50"
                >
                  <option value="course" className="bg-[#0d1322]">كورس متاح — بدون خصم</option>
                  <option value="offer" className="bg-[#0d1322]">عرض بخصم</option>
                </select>
              </Field>
              <Field required label="التصنيف" error={fieldErrors.category}>
                <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Cyber Security, English..." />
              </Field>
              <Field label="العنوان التسويقي" error={fieldErrors.headline}>
                <input value={editing.headline} onChange={(e) => setEditing({ ...editing, headline: e.target.value })} placeholder="وصف قصير وجذاب" />
              </Field>
              {editing.adType === "offer" && (
                <Field required label="السعر الأصلي (EGP)" error={fieldErrors.originalPrice} hint="السعر قبل الخصم.">
                  <input type="number" min="0" step="1" value={editing.originalPrice} onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value })} placeholder="مثال: 1500" />
                </Field>
              )}
              <Field required label={editing.adType === "offer" ? "سعر العرض (EGP)" : "سعر الكورس (EGP)"} error={fieldErrors.offerPrice}>
                <input type="number" min="0" step="1" value={editing.offerPrice} onChange={(e) => setEditing({ ...editing, offerPrice: e.target.value })} placeholder="0 للكورس المجاني" />
              </Field>
              <Field required label="نص زر التسجيل" error={fieldErrors.ctaText}>
                <input value={editing.ctaText} onChange={(e) => setEditing({ ...editing, ctaText: e.target.value })} />
              </Field>
              <Field required={editing.published && !editing.archived} label="رابط التسجيل / CTA" error={fieldErrors.ctaUrl} hint="يمكن كتابة الرابط بدون https وسيتم إضافته تلقائيًا.">
                <input inputMode="url" value={editing.ctaUrl} onChange={(e) => setEditing({ ...editing, ctaUrl: e.target.value })} placeholder="https://example.com/register" />
              </Field>
              <Field label="بداية النشر" error={fieldErrors.startsAt}>
                <input type="datetime-local" value={editing.startsAt} onChange={(e) => setEditing({ ...editing, startsAt: e.target.value })} />
              </Field>
              <Field label="نهاية النشر" error={fieldErrors.endsAt}>
                <input type="datetime-local" value={editing.endsAt} onChange={(e) => setEditing({ ...editing, endsAt: e.target.value })} />
              </Field>

              <div className="md:col-span-2">
                <Field label="رابط صورة الإعلان" error={fieldErrors.imageUrl} hint="Google Drive وDropbox وCloudinary وR2 وS3 وأي رابط HTTPS عام. تأكد أن الملف Public.">
                  <input inputMode="url" value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} placeholder="https://..." />
                </Field>

                {editing.imageUrl.trim() && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    <div className="border-b border-white/10 px-3 py-2 text-xs font-bold text-slate-500">معاينة الصورة عبر Image Proxy</div>
                    <div className="min-h-48">
                      <CloudImage
                        src={editing.imageUrl}
                        alt="معاينة الإعلان"
                        className="max-h-72 w-full object-contain"
                        fallbackClassName="grid min-h-48 place-items-center text-rose-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Field label="الوصف" error={fieldErrors.description}>
                  <textarea rows={5} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="تفاصيل الكورس والعرض..." />
                </Field>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Toggle
                label="منشور"
                checked={editing.published}
                disabled={editing.archived}
                onChange={(checked) => setEditing({ ...editing, published: checked })}
              />
              <Toggle
                label="مميز"
                checked={editing.featured}
                onChange={(checked) => setEditing({ ...editing, featured: checked })}
              />
              <Toggle
                label="مؤرشف"
                checked={editing.archived}
                onChange={(checked) => setEditing({ ...editing, archived: checked, published: checked ? false : editing.published })}
              />
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
              <button disabled={busy} onClick={() => setEditing(null)} className="rounded-xl border border-white/10 px-5 py-2.5 hover:bg-white/[0.04] disabled:opacity-50">إلغاء</button>
              <button disabled={busy} onClick={() => void save()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 font-bold hover:bg-violet-500 disabled:opacity-60">
                {busy ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                {busy ? "جاري الحفظ..." : "حفظ الإعلان"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-violet-400">{icon}</div>
      <strong className="mt-3 block text-3xl">{value}</strong>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}

function Action({ icon, children, onClick, danger = false }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${danger ? "border-rose-400/15 text-rose-300 hover:bg-rose-500/10" : "border-white/10 hover:bg-white/[0.05]"}`}>
      {icon}{children}
    </button>
  );
}

function Field({ label, children, error, hint, required = false }: { label: string; children: React.ReactNode; error?: string; hint?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-slate-400">{label}{required && <span className="mr-1 text-rose-400">*</span>}</span>
      <div className={`[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:bg-black/20 [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_input]:transition [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:bg-black/20 [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:transition ${error ? "[&_input]:border-rose-400/50 [&_textarea]:border-rose-400/50" : "[&_input]:border-white/10 [&_textarea]:border-white/10 [&_input]:focus:border-violet-400/50 [&_textarea]:focus:border-violet-400/50"}`}>
        {children}
      </div>
      {error ? <span className="text-xs font-bold text-rose-400">{error}</span> : hint ? <span className="text-xs leading-5 text-slate-600">{hint}</span> : null}
    </label>
  );
}

function Toggle({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
