import Link from "next/link";
import { BarChart3, Cloud, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { listPublicAds } from "@/lib/ads";
import { PublicOffers } from "@/components/public-offers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const ads = await listPublicAds();

  return (
    <main>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/80 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-violet-600 font-black">V</div>
            <div>
              <div className="font-black tracking-wide">VIDORA ADS</div>
              <div className="text-xs text-slate-500">Independent Course Ads</div>
            </div>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold hover:bg-white/[0.07]"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-300">
            <Sparkles size={14} /> COURSE ADVERTISEMENTS
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
            اعرض كورساتك بشكل <span className="text-violet-400">احترافي ومرن</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            مشروع مستقل لإدارة إعلانات الكورسات، الصور السحابية، العروض، الجدولة، والمحتوى المميز.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#offers" className="rounded-2xl bg-violet-600 px-6 py-3 font-bold hover:bg-violet-500">
              شاهد العروض
            </a>
            <Link href="/admin" className="rounded-2xl border border-white/10 px-6 py-3 font-bold hover:bg-white/[0.05]">
              إدارة الإعلانات
            </Link>
          </div>
        </div>

        <div className="card-glow rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
          <div className="grid aspect-[4/3] place-items-center rounded-[1.5rem] bg-gradient-to-br from-violet-600 to-cyan-500/70">
            <GraduationCap size={110} strokeWidth={1.3} />
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <div><strong className="block text-2xl">{ads.length}</strong><span className="text-xs text-slate-500">إعلان نشط</span></div>
            <div><strong className="block text-2xl">D1</strong><span className="text-xs text-slate-500">Cloud Database</span></div>
            <div><strong className="block text-2xl">HTTPS</strong><span className="text-xs text-slate-500">Cloud Images</span></div>
          </div>
        </div>
      </section>

      <section id="offers" className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8">
          <div className="text-xs font-bold tracking-widest text-violet-400">ACTIVE OFFERS</div>
          <h2 className="mt-2 text-4xl font-black">إعلانات الكورسات</h2>
        </div>
        <PublicOffers ads={ads} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-16 md:grid-cols-3">
        {[
          [Cloud, "صور من أي Cloud", "استخدم روابط HTTPS من R2 وS3 وCloudinary وDrive وغيرها."],
          [ShieldCheck, "إدارة منفصلة", "المشروع وقاعدة البيانات والجلسات مستقلة بالكامل عن Vidora الأصلي."],
          [BarChart3, "Analytics", "Views وClicks وCTR لكل إعلان مع لوحة إدارة مخصصة."]
        ].map(([Icon, title, text]) => {
          const C = Icon as typeof Cloud;
          return (
            <div key={String(title)} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <C size={28} className="text-violet-400" />
              <h3 className="mt-4 text-lg font-bold">{title as string}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">{text as string}</p>
            </div>
          );
        })}
      </section>
    </main>
  );
}
