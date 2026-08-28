"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, LockKeyhole, LogIn, ShieldCheck } from "lucide-react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, rememberMe })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        if (data?.recoveryCode) {
          setRecoveryCode(String(data.recoveryCode));
          setBusy(false);
          return;
        }
        window.location.href = "/admin";
        return;
      }

      if (data?.error === "not_configured") {
        window.location.href = "/admin/setup";
        return;
      }

      setError(data?.message || "تعذر تسجيل الدخول.");
    } catch {
      setError("تعذر الاتصال بالموقع. أعد المحاولة.");
    } finally {
      setBusy(false);
    }
  }

  if (recoveryCode) {
    return (
      <div className="w-full max-w-lg rounded-[2rem] border border-emerald-400/15 bg-white/[0.04] p-7 soft-shadow">
        <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300">
          <ShieldCheck size={23} />
        </div>
        <h1 className="mt-5 text-3xl font-black">احفظ كود الاسترجاع</h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          تم تسجيل الدخول بنجاح. هذا الكود يظهر مرة واحدة فقط ويُستخدم لاسترجاع الإدارة إذا نسيت كلمة المرور.
        </p>
        <div className="mt-5 break-all rounded-2xl border border-white/10 bg-black/25 p-4 font-mono text-sm font-bold text-emerald-300">
          {recoveryCode}
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(recoveryCode)}
          className="mt-3 w-full rounded-2xl border border-white/10 px-4 py-3 font-bold hover:bg-white/[0.04]"
        >
          نسخ كود الاسترجاع
        </button>
        <button
          onClick={() => { window.location.href = "/admin"; }}
          className="mt-3 w-full rounded-2xl bg-violet-600 px-4 py-3 font-black hover:bg-violet-500"
        >
          متابعة إلى لوحة الإدارة
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 soft-shadow">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-violet-600">
          <LockKeyhole size={22} />
        </div>
        <Link href="/" className="text-xs font-bold text-slate-500 hover:text-white">العودة للموقع</Link>
      </div>

      <h1 className="text-3xl font-black">دخول الإدارة</h1>
      <p className="mt-2 text-sm leading-7 text-slate-500">
        استخدم كلمة المرور التي أنشأتها للإدارة.
      </p>

      <label className="mt-6 block text-sm text-slate-400">كلمة المرور</label>
      <div className="mt-2 flex items-center rounded-2xl border border-white/10 bg-black/20 px-3 focus-within:border-violet-400/50">
        <KeyRound size={17} className="text-slate-500" />
        <input
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
          onKeyDown={(event) => setCapsLock(event.getModifierState("CapsLock"))}
          placeholder="كلمة المرور"
          className="w-full bg-transparent px-3 py-3 outline-none"
        />
        <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-500 hover:text-white" aria-label="إظهار أو إخفاء كلمة المرور">
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {capsLock && <div className="mt-2 text-xs font-bold text-amber-300">Caps Lock مفعّل.</div>}

      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-400">
          <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
          تذكرني على هذا الجهاز
        </label>
        <Link href="/admin/recover" className="font-bold text-violet-300 hover:text-violet-200">نسيت كلمة المرور؟</Link>
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-400/15 bg-rose-500/10 px-3 py-2 text-sm leading-6 text-rose-300">{error}</div>}

      <button
        disabled={busy || !password}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-black transition hover:bg-violet-500 disabled:opacity-60"
      >
        {busy ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
        {busy ? "جاري التحقق..." : "دخول"}
      </button>
    </form>
  );
}
