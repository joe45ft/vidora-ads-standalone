"use client";

import { useState } from "react";
import { LockKeyhole, LogIn } from "lucide-react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (response.ok) {
      window.location.href = "/admin";
      return;
    }

    setBusy(false);
    setError("كلمة المرور غير صحيحة.");
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 soft-shadow">
      <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-violet-600">
        <LockKeyhole size={22} />
      </div>

      <h1 className="text-3xl font-black">Admin Login</h1>
      <p className="mt-2 text-sm leading-7 text-slate-500">
        أدخل كلمة المرور التي أنشأتها في أول إعداد للموقع.
      </p>

      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="mt-6 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
      />

      {error && <div className="mt-3 text-sm text-rose-400">{error}</div>}

      <button
        disabled={busy}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-black transition hover:bg-violet-500 disabled:opacity-60"
      >
        <LogIn size={17} />
        {busy ? "جاري الدخول..." : "دخول"}
      </button>
    </form>
  );
}
