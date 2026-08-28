import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgePercent,
  BookOpen,
  CalendarDays,
  Headphones,
  Star
} from "lucide-react";
import { getPublicAdBySlug } from "@/lib/ads";
import { getSiteSettings } from "@/lib/site-settings";
import { CourseDetailActions } from "@/components/course-detail-actions";
import { CloudImage } from "@/components/cloud-image";
import { CourseViewTracker } from "@/components/course-view-tracker";

export const dynamic = "force-dynamic";

function discount(oldPrice: number | null, price: number) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}

function displayPrice(value: number) {
  return value === 0 ? "مجاني" : `${value.toLocaleString()} EGP`;
}

export default async function CoursePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const [ad, settings] = await Promise.all([
    getPublicAdBySlug(slug),
    getSiteSettings()
  ]);

  if (!ad) notFound();

  const percentage = discount(ad.originalPrice, ad.offerPrice);

  return (
    <main className="min-h-screen">
      <CourseViewTracker adId={ad.id} />
      <header className="border-b border-white/[0.07] bg-[#060a12]/85 backdrop-blur-xl">
        <div className="page-shell flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            {settings.logoUrl ? (
              <div className="size-11 overflow-hidden rounded-2xl border border-white/10">
                <CloudImage
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  loading="eager"
                  className="h-full w-full object-cover"
                  fallbackClassName="grid h-full place-items-center bg-violet-600 font-black"
                />
              </div>
            ) : (
              <div className="grid size-11 place-items-center rounded-2xl bg-violet-600 font-black">
                {settings.siteName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-black">{settings.siteName}</div>
              <div className="text-[11px] text-slate-500">{settings.tagline}</div>
            </div>
          </Link>

          <Link href="/#offers" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white">
            رجوع للعروض <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="page-shell py-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025]">
            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#19142d] to-[#0f5971]">
              <CloudImage
                src={ad.imageUrl}
                alt={ad.courseName}
                loading="eager"
                className="h-full w-full object-cover"
                fallbackClassName="grid h-full place-items-center bg-gradient-to-br from-[#19142d] to-[#0f5971] text-6xl font-black text-white/30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute right-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
                  {ad.category}
                </span>
                {percentage > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-black text-emerald-950">
                    <BadgePercent size={13} /> {percentage}% خصم
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 md:p-8">
            <div className="flex flex-wrap gap-2 text-xs font-black text-violet-300">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={14} /> {ad.title}
              </span>
              {ad.featured && (
                <span className="inline-flex items-center gap-1.5">
                  <Star size={14} fill="currentColor" /> مميز
                </span>
              )}
            </div>

            <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              {ad.courseName}
            </h1>

            {ad.headline && (
              <p className="mt-5 text-lg leading-8 text-slate-300">{ad.headline}</p>
            )}

            {ad.description && (
              <div className="mt-6 whitespace-pre-line text-sm leading-8 text-slate-500">
                {ad.description}
              </div>
            )}

            <div className="mt-7 border-y border-white/10 py-5">
              {ad.originalPrice && ad.originalPrice > ad.offerPrice ? (
                <div className="text-sm text-slate-600 line-through">
                  {ad.originalPrice.toLocaleString()} EGP
                </div>
              ) : null}
              <div className="mt-1 text-3xl font-black">{displayPrice(ad.offerPrice)}</div>
            </div>

            {(ad.startsAt || ad.endsAt) && (
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
                {ad.startsAt && (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={16} />
                    يبدأ: {new Date(ad.startsAt).toLocaleDateString("ar-EG")}
                  </span>
                )}
                {ad.endsAt && (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={16} />
                    ينتهي: {new Date(ad.endsAt).toLocaleDateString("ar-EG")}
                  </span>
                )}
              </div>
            )}

            <div className="mt-8">
              <CourseDetailActions
                adId={ad.id}
                ctaText={ad.ctaText}
                ctaUrl={ad.ctaUrl}
                supportLabel={settings.supportLabel}
                supportUrl={settings.supportUrl}
              />
            </div>
          </div>
        </div>

        {settings.supportUrl && settings.supportText && (
          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
                <Headphones size={20} />
              </div>
              <div>
                <h2 className="font-black">تحتاج مساعدة؟</h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">{settings.supportText}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
