"use client";

import { useState } from "react";
import { ExternalLink, Save, Settings2 } from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";

export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      window.location.href = "/admin/login";
      return;
    }

    setBusy(false);

    if (!response.ok) {
      setMessage(data?.message || "تعذر حفظ الإعدادات.");
      return;
    }

    setForm(data.settings);
    setMessage("تم حفظ إعدادات الموقع بنجاح.");
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="font-black">هوية الموقع</h2>
            <p className="text-sm text-slate-500">تظهر للزوار في الهيدر والفوتر.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-400">اسم الموقع</span>
            <input
              value={form.siteName}
              onChange={(e) => set("siteName", e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-400">Tagline</span>
            <input
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="text-slate-400">رابط الشعار (اختياري)</span>
            <input
              value={form.logoUrl ?? ""}
              onChange={(e) => set("logoUrl", e.target.value || null)}
              placeholder="https://..."
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
            />
          </label>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-black">Contact / Support</h2>
        <p className="mt-1 text-sm text-slate-500">
          الرابط يمكن أن يكون WhatsApp أو صفحة تواصل أو mailto أو tel.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-400">نص الزر</span>
            <input
              value={form.supportLabel}
              onChange={(e) => set("supportLabel", e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-400">رابط الدعم</span>
            <input
              value={form.supportUrl ?? ""}
              onChange={(e) => set("supportUrl", e.target.value || null)}
              placeholder="https://wa.me/201..."
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="text-slate-400">رسالة الدعم</span>
            <textarea
              rows={3}
              value={form.supportText}
              onChange={(e) => set("supportText", e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="text-slate-400">نص الفوتر</span>
            <input
              value={form.footerText}
              onChange={(e) => set("footerText", e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
            />
          </label>
        </div>

        {form.supportUrl && (
          <a
            href={form.supportUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-300"
          >
            اختبار رابط الدعم <ExternalLink size={15} />
          </a>
        )}
      </div>

      {message && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          {message}
        </div>
      )}

      <button
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 font-black transition hover:bg-violet-500 disabled:opacity-60"
      >
        <Save size={18} />
        {busy ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </form>
  );
}
