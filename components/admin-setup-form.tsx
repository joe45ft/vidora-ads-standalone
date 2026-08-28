"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

export function AdminSetupForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
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

    const response = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (response.ok) {
      window.location.href = "/admin";
      return;
    }

    const data = await response.json().catch(() => ({}));
    setBusy(false);
    setError(data?.error === "already_configured"
      ? "تم إعداد الإدارة بالفعل."
      : "تعذر إكمال الإعداد.");
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
        اختر كلمة مرور الأدمن مرة واحدة. الموقع سيولّد مفتاح الجلسة تلقائيًا ويحفظ الإعدادات بشكل آمن داخل D1.
      </p>

      <div className="mt-6 grid gap-3">
        <label className="grid gap-2 text-sm">
          <span className="text-slate-400">كلمة المرور</span>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4">
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
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
        </label>
      </div>

      {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}

      <button
        disabled={busy}
        className="mt-6 w-full rounded-2xl bg-violet-600 px-4 py-3 font-black transition hover:bg-violet-500 disabled:opacity-60"
      >
        {busy ? "جاري الإعداد..." : "إنشاء حساب الإدارة"}
      </button>

      <p className="mt-4 text-center text-xs leading-6 text-slate-600">
        بعد الإعداد الأول سيتم إغلاق صفحة Setup تلقائيًا.
      </p>
    </form>
  );
}
