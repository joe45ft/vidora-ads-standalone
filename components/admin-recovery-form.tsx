"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, LifeBuoy, Loader2, ShieldCheck } from "lucide-react";

export function AdminRecoveryForm() {
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");

    if (!recoveryCode.trim()) return setError("أدخل كود الاسترجاع.");
    if (newPassword.length < 8) return setError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.");
    if (newPassword !== confirm) return setError("تأكيد كلمة المرور غير مطابق.");

    setBusy(true);
    try {
      const response = await fetch("/api/admin/recover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recoveryCode, newPassword })
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setNewRecoveryCode(String(data.recoveryCode || ""));
        return;
      }
      setError(data?.message || "تعذر استرجاع حساب الإدارة.");
    } catch {
      setError("تعذر الاتصال بالموقع.");
    } finally {
      setBusy(false);
    }
  }

  if (newRecoveryCode) {
    return (
      <div className="w-full max-w-lg rounded-[2rem] border border-emerald-400/15 bg-white/[0.04] p-7 soft-shadow">
        <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300"><ShieldCheck size={23} /></div>
        <h1 className="mt-5 text-3xl font-black">تم استرجاع الإدارة</h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">تم تغيير كلمة المرور وإلغاء الجلسات القديمة. احفظ كود الاسترجاع الجديد.</p>
        <div className="mt-5 break-all rounded-2xl border border-white/10 bg-black/25 p-4 font-mono text-sm font-bold text-emerald-300">{newRecoveryCode}</div>
        <button onClick={() => navigator.clipboard.writeText(newRecoveryCode)} className="mt-3 w-full rounded-2xl border border-white/10 px-4 py-3 font-bold hover:bg-white/[0.04]">نسخ الكود الجديد</button>
        <button onClick={() => { window.location.href = "/admin"; }} className="mt-3 w-full rounded-2xl bg-violet-600 px-4 py-3 font-black hover:bg-violet-500">متابعة إلى الإدارة</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 soft-shadow">
      <div className="mb-5 flex items-center justify-between">
        <div className="grid size-12 place-items-center rounded-2xl bg-violet-600"><LifeBuoy size={22} /></div>
        <Link href="/admin/login" className="text-xs font-bold text-slate-500 hover:text-white">العودة لتسجيل الدخول</Link>
      </div>
      <h1 className="text-3xl font-black">استرجاع الإدارة</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500">استخدم كود الاسترجاع الذي ظهر عند إنشاء الإدارة أو بعد آخر تغيير لكلمة المرور.</p>

      <label className="mt-6 grid gap-2 text-sm">
        <span className="text-slate-400">كود الاسترجاع</span>
        <input value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value)} placeholder="VIDORA-..." className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono outline-none focus:border-violet-400/50" />
      </label>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-2 text-sm">
          <span className="text-slate-400">كلمة المرور الجديدة</span>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 focus-within:border-violet-400/50">
            <KeyRound size={17} className="text-slate-500" />
            <input type={show ? "text" : "password"} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full bg-transparent py-3 outline-none" />
            <button type="button" onClick={() => setShow((value) => !value)} className="text-slate-500 hover:text-white">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-400">تأكيد كلمة المرور</span>
          <input type={show ? "text" : "password"} value={confirm} onChange={(event) => setConfirm(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50" />
        </label>
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-400/15 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</div>}
      <button disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-black hover:bg-violet-500 disabled:opacity-60">
        {busy ? <Loader2 size={17} className="animate-spin" /> : <LifeBuoy size={17} />}{busy ? "جاري الاسترجاع..." : "استرجاع الحساب"}
      </button>
    </form>
  );
}
