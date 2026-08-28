"use client";

import { ArrowLeft, BadgePercent, Star } from "lucide-react";

export type AdCardData = {
  id: string;
  title: string;
  courseName: string;
  category: string;
  headline: string | null;
  description: string | null;
  imageUrl: string | null;
  originalPrice: number | null;
  offerPrice: number;
  ctaText: string;
  ctaUrl: string;
  featured: boolean;
};

function discount(oldPrice: number | null, price: number) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}

export function AdCard({ ad }: { ad: AdCardData }) {
  const d = discount(ad.originalPrice, ad.offerPrice);

  async function openAd() {
    try {
      await fetch(`/api/ads/${ad.id}/click`, { method: "POST" });
    } finally {
      window.open(ad.ctaUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-violet-400/40">
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-800 to-violet-900">
        {ad.imageUrl ? (
          <img src={ad.imageUrl} alt={ad.courseName} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-5xl font-black text-white/25">V</div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs backdrop-blur">
          {ad.category}
        </div>
        {ad.featured && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">
            <Star size={13} fill="currentColor" /> Featured
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
          <span>{ad.title}</span>
          {d > 0 && (
            <span className="flex items-center gap-1 text-emerald-300">
              <BadgePercent size={14} /> خصم {d}%
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold">{ad.courseName}</h3>
        <p className="mt-2 min-h-14 text-sm leading-7 text-slate-400">
          {ad.headline || ad.description || "اكتشف تفاصيل هذا الكورس والعرض الحالي."}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
          <div>
            {ad.originalPrice ? (
              <div className="text-xs text-slate-600 line-through">{ad.originalPrice.toLocaleString()} EGP</div>
            ) : null}
            <div className="text-xl font-extrabold">{ad.offerPrice.toLocaleString()} EGP</div>
          </div>
          <button
            onClick={openAd}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold transition hover:bg-violet-500"
          >
            {ad.ctaText}
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
