"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";

export function AdminSecurityForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (newPassword.length < 8) return setError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.");
    if (newPassword !== confirm) return setError("تأكيد كلمة المرور غير مطابق.");

    setBusy(true);
    try {
      const response = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401 && data?.error === "unauthorized") {
        window.location.href = "/admin/login";
        return;
      }
      if (!response.ok) {
        setError(data?.message || "تعذر تحديث كلمة المرور.");
        return;
      }
      setRecoveryCode(String(data.recoveryCode || ""));
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setError("تعذر الاتصال بالموقع.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 soft-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-violet-600"><ShieldCheck size={23} /></div>
        <Link href="/admin" className="text-sm font-bold text-slate-500 hover:text-white">العودة للإدارة</Link>
      </div>
      <h1 className="mt-5 text-3xl font-black">أمان الإدارة</h1>
      <p className="mt-2 text-sm leading-7 text-slate-500">غيّر كلمة المرور وسيتم إلغاء الجلسات القديمة وإنشاء كود استرجاع جديد.</p>

      <form onSubmit={submit} className="mt-6 grid gap-3">
        <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="كلمة المرور الحالية" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50" />
        <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="كلمة المرور الجديدة" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50" />
        <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="تأكيد كلمة المرور الجديدة" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50" />
        {error && <div className="rounded-xl border border-rose-400/15 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</div>}
        <button disabled={busy || !currentPassword || !newPassword || !confirm} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-black hover:bg-violet-500 disabled:opacity-60">
          {busy ? <Loader2 size={17} className="animate-spin" /> : <KeyRound size={17} />}{busy ? "جاري التحديث..." : "تغيير كلمة المرور"}
        </button>
      </form>

      {recoveryCode && (
        <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-500/5 p-4">
          <div className="font-black text-emerald-300">احفظ كود الاسترجاع الجديد</div>
          <div className="mt-3 break-all rounded-xl bg-black/25 p-3 font-mono text-sm text-emerald-200">{recoveryCode}</div>
          <button onClick={() => navigator.clipboard.writeText(recoveryCode)} className="mt-3 text-sm font-bold text-emerald-300">نسخ الكود</button>
        </div>
      )}
    </div>
  );
}
