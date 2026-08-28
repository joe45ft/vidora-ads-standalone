"use client";

import { useEffect, useRef } from "react";
import { ArrowUpLeft, BadgePercent, BookOpenCheck, Sparkles, Star } from "lucide-react";
import { CloudImage } from "@/components/cloud-image";

export type AdCardData = {
  id: string;
  title: string;
  courseName: string;
  category: string;
  headline: string | null;
  description: string | null;
  imageUrl: string | null;
  adType: "course" | "offer";
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

function priceText(price: number) {
  return price === 0 ? "مجاني" : price.toLocaleString();
}

function trackClick(id: string) {
  void fetch(`/api/ads/${id}/click`, {
    method: "POST",
    keepalive: true
  }).catch(() => undefined);
}

export function AdCard({ ad, featured = false }: { ad: AdCardData; featured?: boolean }) {
  const isOffer = ad.adType === "offer";
  const percentage = isOffer ? discount(ad.originalPrice, ad.offerPrice) : 0;
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = cardRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const storageKey = `vidora-ad-view:${ad.id}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {
      // Tracking can continue without sessionStorage.
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.45);
        if (!visible) return;

        try { sessionStorage.setItem(storageKey, "1"); } catch {}
        void fetch(`/api/ads/${ad.id}/view`, { method: "POST", keepalive: true }).catch(() => undefined);
        observer.disconnect();
      },
      { threshold: [0.45] }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ad.id]);

  return (
    <article
      ref={cardRef}
      className={[
        "group overflow-hidden rounded-[1.7rem] border border-white/[0.085] bg-white/[0.035]",
        "transition duration-300 hover:-translate-y-1 hover:border-violet-400/35 hover:bg-white/[0.045]",
        featured ? "md:grid md:grid-cols-[1.05fr_.95fr]" : ""
      ].join(" ")}
    >
      <div className={[
        "relative overflow-hidden bg-gradient-to-br from-[#19142d] via-[#181c39] to-[#0f5971]",
        featured ? "min-h-[280px] md:min-h-[360px]" : "aspect-[16/10]"
      ].join(" ")}>
        <CloudImage
          src={ad.imageUrl}
          alt={ad.courseName}
          loading={featured ? "eager" : "lazy"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          fallbackClassName="grid h-full min-h-[220px] place-items-center bg-gradient-to-br from-[#19142d] via-[#181c39] to-[#0f5971] text-white/35"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

        <div className="absolute right-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
            {ad.category}
          </span>

          {isOffer && percentage > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-black text-emerald-950">
              <BadgePercent size={13} />
              {percentage}% خصم
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-300 px-3 py-1.5 text-xs font-black text-cyan-950">
              <BookOpenCheck size={13} />
              كورس متاح
            </span>
          )}
        </div>

        {ad.featured && (
          <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
            <Star size={13} fill="currentColor" />
            مميز
          </div>
        )}
      </div>

      <div className={featured ? "flex flex-col justify-center p-7 md:p-9" : "p-5"}>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-violet-300">
          <Sparkles size={14} />
          {ad.title}
        </div>

        <h3 className={featured ? "text-3xl font-black leading-tight" : "text-xl font-black leading-snug"}>
          {ad.courseName}
        </h3>

        <p className={[
          "mt-3 text-slate-400",
          featured ? "max-w-xl text-base leading-8" : "min-h-14 text-sm leading-7"
        ].join(" ")}>
          {ad.headline || ad.description || (isOffer ? "اكتشف تفاصيل العرض وسجّل مباشرة." : "اكتشف تفاصيل الكورس وسجّل مباشرة.")}
        </p>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
          <div>
            {isOffer && ad.originalPrice != null ? (
              <div className="mb-1 text-sm text-slate-600 line-through">
                {ad.originalPrice.toLocaleString()} EGP
              </div>
            ) : (
              <div className="mb-1 text-xs font-bold text-slate-500">{isOffer ? "سعر العرض" : "سعر الكورس"}</div>
            )}
            <div className="text-2xl font-black">
              {priceText(ad.offerPrice)} {ad.offerPrice !== 0 && <span className="text-sm text-slate-400">EGP</span>}
            </div>
          </div>

          <a
            href={ad.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(ad.id)}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black transition hover:bg-violet-500 active:scale-[.98]"
          >
            {ad.ctaText}
            <ArrowUpLeft size={17} />
          </a>
        </div>
      </div>
    </article>
  );
}
