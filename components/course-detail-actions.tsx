"use client";

import { ArrowUpLeft, Headphones } from "lucide-react";

export function CourseDetailActions({
  adId,
  ctaText,
  ctaUrl,
  supportLabel,
  supportUrl
}: {
  adId: string;
  ctaText: string;
  ctaUrl: string;
  supportLabel: string;
  supportUrl: string | null;
}) {
  function register() {
    const viewKey = `vidora-ad-view:${adId}`;
    const clickKey = `vidora-ad-click:${adId}`;

    try {
      if (!sessionStorage.getItem(viewKey)) {
        sessionStorage.setItem(viewKey, "1");
        void fetch(`/api/ads/${adId}/view`, {
          method: "POST",
          keepalive: true
        }).catch(() => undefined);
      }

      if (!sessionStorage.getItem(clickKey)) {
        sessionStorage.setItem(clickKey, "1");
        void fetch(`/api/ads/${adId}/click`, {
          method: "POST",
          keepalive: true
        }).catch(() => undefined);
      }
    } catch {
      void fetch(`/api/ads/${adId}/click`, {
        method: "POST",
        keepalive: true
      }).catch(() => undefined);
    }

    const target = window.open(ctaUrl, "_blank", "noopener,noreferrer");
    if (!target) window.location.href = ctaUrl;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={register}
        className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 font-black hover:bg-violet-500"
      >
        {ctaText}
        <ArrowUpLeft size={18} />
      </button>

      {supportUrl && (
        <a
          href={supportUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-black hover:bg-white/[0.06]"
        >
          <Headphones size={18} />
          {supportLabel}
        </a>
      )}
    </div>
  );
}
