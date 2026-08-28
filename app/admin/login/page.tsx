"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
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
    setError("كلمة المرور غير صحيحة أو إعدادات الإدارة غير مكتملة.");
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 card-glow">
        <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-violet-600"><LockKeyhole /></div>
        <h1 className="text-3xl font-black">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-500">استخدم ADMIN_PASSWORD الموجود في Cloudflare Secrets.</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-6 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400/50"
        />

        {error && <div className="mt-3 text-sm text-rose-400">{error}</div>}

        <button disabled={busy} className="mt-5 w-full rounded-2xl bg-violet-600 px-4 py-3 font-bold disabled:opacity-60">
          {busy ? "..." : "Login"}
        </button>
      </form>
    </main>
  );
}
