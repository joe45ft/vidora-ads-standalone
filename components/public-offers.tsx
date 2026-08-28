"use client";

import { useMemo, useState } from "react";
import { BadgePercent, BookOpenCheck, Search, SlidersHorizontal } from "lucide-react";
import { AdCard, type AdCardData } from "@/components/ad-card";

type TypeFilter = "all" | "course" | "offer";

export function PublicOffers({ ads }: { ads: AdCardData[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState<TypeFilter>("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(ads.map((ad) => ad.category))).sort()],
    [ads]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return ads.filter((ad) => {
      const categoryOk = category === "all" || ad.category === category;
      const typeOk = type === "all" || ad.adType === type;
      const text = `${ad.title} ${ad.courseName} ${ad.category} ${ad.headline ?? ""} ${ad.description ?? ""}`.toLowerCase();
      return categoryOk && typeOk && (!q || text.includes(q));
    });
  }, [ads, query, category, type]);

  if (!ads.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-300"><Search size={24} /></div>
        <h3 className="mt-5 text-xl font-black">لا توجد كورسات أو عروض منشورة حاليًا</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">بمجرد نشر أول إعلان من لوحة الإدارة سيظهر هنا تلقائيًا.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <TypeButton active={type === "all"} onClick={() => setType("all")}>الكل</TypeButton>
        <TypeButton active={type === "course"} onClick={() => setType("course")} icon={<BookOpenCheck size={15} />}>الكورسات المتاحة</TypeButton>
        <TypeButton active={type === "offer"} onClick={() => setType("offer")} icon={<BadgePercent size={15} />}>عروض الخصم</TypeButton>
      </div>

      <div className="mb-6 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-3 md:flex md:items-center md:gap-3">
        <label className="flex flex-1 items-center gap-3 rounded-2xl bg-black/20 px-4 py-3">
          <Search size={18} className="shrink-0 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم الكورس أو التصنيف..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600" />
        </label>

        <label className="mt-3 flex min-w-[190px] items-center gap-3 rounded-2xl bg-black/20 px-4 py-3 md:mt-0">
          <SlidersHorizontal size={18} className="shrink-0 text-slate-500" />
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full bg-transparent text-sm outline-none">
            {categories.map((item) => <option key={item} value={item} className="bg-slate-950">{item === "all" ? "كل التصنيفات" : item}</option>)}
          </select>
        </label>
      </div>

      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? "إعلان" : "إعلانات"}</p>
      </div>

      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((ad) => <AdCard key={ad.id} ad={ad} />)}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/10 px-6 py-14 text-center">
          <h3 className="font-black">لا توجد نتائج مطابقة</h3>
          <p className="mt-2 text-sm text-slate-500">جرب كلمة بحث مختلفة أو اختر نوعًا أو تصنيفًا آخر.</p>
        </div>
      )}
    </>
  );
}

function TypeButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition ${active ? "border-violet-400/30 bg-violet-500/15 text-violet-200" : "border-white/10 bg-white/[0.02] text-slate-500 hover:text-white"}`}>
      {icon}{children}
    </button>
  );
}
