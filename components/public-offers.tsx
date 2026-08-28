"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { AdCard, type AdCardData } from "@/components/ad-card";

export function PublicOffers({ ads }: { ads: AdCardData[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(ads.map((ad) => ad.category))).sort()],
    [ads]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ads.filter((ad) => {
      const matchesCategory = category === "all" || ad.category === category;
      const haystack = `${ad.title} ${ad.courseName} ${ad.category} ${ad.headline ?? ""}`.toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [ads, query, category]);

  return (
    <>
      <div className="mb-7 flex flex-col gap-3 md:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
          <Search size={18} className="text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن كورس أو تصنيف..."
            className="w-full bg-transparent outline-none placeholder:text-slate-600"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
          <SlidersHorizontal size={18} className="text-slate-500" />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="bg-transparent outline-none"
          >
            {categories.map((item) => (
              <option key={item} value={item} className="bg-slate-950">
                {item === "all" ? "كل التصنيفات" : item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((ad) => <AdCard key={ad.id} ad={ad} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center text-slate-500">
          لا توجد إعلانات مطابقة.
        </div>
      )}
    </>
  );
}
