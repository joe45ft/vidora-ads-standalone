"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-300">
          <AlertTriangle size={25} />
        </div>
        <h1 className="mt-5 text-2xl font-black">تعذر تحميل الصفحة</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">حدث خطأ مؤقت أثناء الاتصال بالخدمة. جرّب إعادة تحميل الصفحة.</p>
        <button onClick={reset} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-black hover:bg-violet-500">
          <RefreshCw size={17} /> إعادة المحاولة
        </button>
      </div>
    </main>
  );
}
