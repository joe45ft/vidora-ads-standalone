"use client";

import { useState } from "react";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";

export function AdminSetupForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");

    if (password.length < 8) {
      setError("استخدم كلمة مرور من 8 أحرف على الأقل.");
      return;
    }

    if (password !== confirm) {
      setError("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        window.location.href = "/admin";
        return;
      }

      if (data?.error === "already_configured") {
        window.location.href = "/admin/login";
        return;
      }

      if (data?.error === "database_unavailable") {
        setError("تعذر الوصول إلى قاعدة D1. تأكد من أن DB مربوط بالـWorker ثم أعد المحاولة.");
        return;
      }

      if (data?.error === "crypto_failed") {
        setError("تعذر إنشاء بيانات الحماية على Cloudflare. أعد المحاولة بعد نشر أحدث نسخة.");
        return;
      }

      setError(data?.message || "تعذر إكمال إعداد الإدارة.");
    } catch {
      setError("تعذر الاتصال بالموقع أثناء الإعداد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 soft-shadow">
      <div className="mb-5 flex items-center justify-between">
        <div className="grid size-12 place-items-center rounded-2xl bg-violet-600">
          <ShieldCheck size={23} />
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
          First Setup
        </span>
      </div>

      <h1 className="text-3xl font-black">إعداد الإدارة</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        اختر كلمة مرور الأدمن مرة واحدة. الموقع ينشئ مفتاح الجلسة والجداول المطلوبة تلقائيًا داخل D1.
      </p>

      <div className="mt-6 grid gap-3">
        <label className="grid gap-2 text-sm">
          <span className="text-slate-400">كلمة المرور</span>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 focus-within:border-violet-400/50">
            <KeyRound size={17} className="text-slate-500" />
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-slate-400">تأكيد كلمة المرور</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
          />
        </label>
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-400/15 bg-rose-500/10 px-3 py-2 text-sm leading-6 text-rose-300">{error}</div>}

      <button
        disabled={busy || password.length < 8 || confirm.length < 8}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-black transition hover:bg-violet-500 disabled:opacity-60"
      >
        {busy && <Loader2 size={17} className="animate-spin" />}
        {busy ? "جاري الإعداد..." : "إنشاء حساب الإدارة"}
      </button>

      <p className="mt-4 text-center text-xs leading-6 text-slate-600">
        بعد الإعداد الأول سيتم إغلاق صفحة Setup تلقائيًا.
      </p>
    </form>
  );
}
