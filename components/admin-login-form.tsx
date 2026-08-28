"use client";

import { useState } from "react";
import { Loader2, LockKeyhole, LogIn } from "lucide-react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
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

  return (
    <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 soft-shadow">
      <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-violet-600">
        <LockKeyhole size={22} />
      </div>

      <h1 className="text-3xl font-black">دخول الإدارة</h1>
      <p className="mt-2 text-sm leading-7 text-slate-500">
        أدخل كلمة المرور التي أنشأتها في أول إعداد للموقع.
      </p>

      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="كلمة المرور"
        className="mt-6 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
      />

      {error && <div className="mt-3 rounded-xl border border-rose-400/15 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</div>}

      <button
        disabled={busy || !password}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-black transition hover:bg-violet-500 disabled:opacity-60"
      >
        {busy ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
        {busy ? "جاري الدخول..." : "دخول"}
      </button>
    </form>
  );
}
