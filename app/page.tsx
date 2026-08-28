import Link from "next/link";
import {
  ArrowDown,
  BookOpen,
  ChevronLeft,
  GraduationCap,
  LayoutGrid,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { listPublicAds } from "@/lib/ads";
import { PublicOffers } from "@/components/public-offers";
import { AdCard } from "@/components/ad-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const ads = await listPublicAds();
  const featured = ads.find((ad) => ad.featured) ?? ads[0] ?? null;
  const categories = Array.from(new Set(ads.map((ad) => ad.category))).slice(0, 8);

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#060a12]/80 backdrop-blur-xl">
        <div className="page-shell flex min-h-20 items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 font-black shadow-lg shadow-violet-950/30">
              V
            </div>
            <div>
              <div className="font-black tracking-[.08em]">VIDORA ADS</div>
              <div className="text-[11px] text-slate-500">Course Marketplace</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold text-slate-400 md:flex">
            <a href="#home" className="transition hover:text-white">الرئيسية</a>
            {featured && <a href="#featured" className="transition hover:text-white">المميز</a>}
            <a href="#offers" className="transition hover:text-white">الكورسات والعروض</a>
            <a href="#categories" className="transition hover:text-white">التصنيفات</a>
          </nav>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            Admin
          </Link>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="page-shell relative py-24 text-center md:py-32">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-black text-violet-300">
            <Sparkles size={14} />
            اكتشف • قارن • سجّل
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black leading-[1.18] md:text-7xl">
            اكتشف الكورس المناسب لك
            <span className="block bg-gradient-to-l from-violet-400 to-cyan-300 bg-clip-text text-transparent">
              بأفضل اختيار متاح
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
            مكان واحد لعرض أحدث الكورسات والخصومات بشكل واضح وسريع، مع تسجيل مباشر من كل إعلان.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href="#offers"
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 font-black transition hover:bg-violet-500"
            >
              تصفح الكورسات والعروض
              <ArrowDown size={17} />
            </a>
            <a
              href="#categories"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-black transition hover:bg-white/[0.055]"
            >
              التصنيفات
              <LayoutGrid size={17} />
            </a>
          </div>
        </div>
      </section>

      {featured && (
        <section id="featured" className="page-shell py-16 md:py-20">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-black tracking-[.2em] text-violet-400">FEATURED</div>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">المميز</h2>
            </div>
            <a href="#offers" className="hidden items-center gap-1 text-sm font-bold text-slate-400 hover:text-white sm:inline-flex">
              الكورسات والعروض
              <ChevronLeft size={17} />
            </a>
          </div>
          <AdCard ad={featured} featured />
        </section>
      )}

      <section id="categories" className="border-y border-white/[0.06] bg-white/[0.012]">
        <div className="page-shell py-14">
          <div className="mb-7">
            <div className="text-xs font-black tracking-[.2em] text-violet-400">CATEGORIES</div>
            <h2 className="mt-2 text-3xl font-black">تصفح حسب التصنيف</h2>
          </div>

          {categories.length ? (
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <a
                  key={category}
                  href="#offers"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                >
                  <BookOpen size={16} className="text-violet-400" />
                  {category}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">ستظهر التصنيفات هنا بعد نشر الإعلانات.</p>
          )}
        </div>
      </section>

      <section id="offers" className="page-shell py-16 md:py-20">
        <div className="mb-8">
          <div className="text-xs font-black tracking-[.2em] text-violet-400">COURSES & OFFERS</div>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">أحدث الكورسات والعروض</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            استخدم البحث أو التصنيفات للوصول للكورس المناسب بسرعة.
          </p>
        </div>

        <PublicOffers ads={ads} />
      </section>

      <section className="page-shell pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: GraduationCap,
              title: "اختيار أسهل",
              text: "معلومات واضحة عن الكورس والسعر والعرض قبل التسجيل."
            },
            {
              icon: ShieldCheck,
              title: "روابط مباشرة",
              text: "كل إعلان يوجهك مباشرة إلى صفحة التسجيل أو التواصل المحددة."
            },
            {
              icon: LayoutGrid,
              title: "تنظيم أفضل",
              text: "بحث وتصنيفات تساعدك على الوصول للمحتوى المناسب بسرعة."
            }
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.025] p-6">
              <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
                <Icon size={21} />
              </div>
              <h3 className="mt-4 font-black">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/[0.07] bg-black/15">
        <div className="page-shell flex flex-col gap-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-violet-600 font-black text-white">V</div>
            <div>
              <div className="font-black text-slate-300">VIDORA ADS</div>
              <div className="text-xs">Course Marketplace</div>
            </div>
          </div>

          <div>© 2026 Vidora Ads. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
