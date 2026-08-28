"use client";

import { BookOpen } from "lucide-react";

const EVENT_NAME = "vidora:set-category";

export function CategoryChips({ categories }: { categories: string[] }) {
  function choose(category: string) {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { category } })
    );

    document.getElementById("offers")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  if (!categories.length) {
    return (
      <p className="text-sm text-slate-500">
        ستظهر التصنيفات هنا بعد نشر الإعلانات.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => choose(category)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
        >
          <BookOpen size={16} className="text-violet-400" />
          {category}
        </button>
      ))}
    </div>
  );
}

export const CATEGORY_EVENT_NAME = EVENT_NAME;
