"use client";

import { useMemo, useState } from "react";
import {
  Archive, BarChart3, Copy, Edit3, Eye, MousePointerClick, Plus, Search,
  Star, Trash2, UploadCloud, X
} from "lucide-react";

type Ad = {
  id: string;
  title: string;
  slug: string;
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
  published: boolean;
  archived: boolean;
  startsAt: string | Date | null;
  endsAt: string | Date | null;
  views: number;
  clicks: number;
};

type FormState = {
  id?: string;
  title: string;
  courseName: string;
  category: string;
  headline: string;
  description: string;
  imageUrl: string;
  originalPrice: string;
  offerPrice: string;
  ctaText: string;
  ctaUrl: string;
  featured: boolean;
  published: boolean;
  archived: boolean;
  startsAt: string;
  endsAt: string;
};

const emptyForm: FormState = {
  title: "", courseName: "", category: "General", headline: "", description: "",
  imageUrl: "", originalPrice: "", offerPrice: "", ctaText: "سجل الآن", ctaUrl: "https://",
  featured: false, published: true, archived: false, startsAt: "", endsAt: ""
};

function toLocalInput(value: string | Date | null) {
  if (!value) return "";
  const d = new Date(value);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function status(ad: Ad) {
  if (ad.archived) return "Archived";
  if (!ad.published) return "Draft";
  const now = Date.now();
  if (ad.startsAt && new Date(ad.startsAt).getTime() > now) return "Scheduled";
  if (ad.endsAt && new Date(ad.endsAt).getTime() < now) return "Expired";
  return "Active";
}

export function AdminDashboard({ initialAds }: { initialAds: Ad[] }) {
  const [ads, setAds] = useState(initialAds);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ads.filter((ad) => `${ad.title} ${ad.courseName} ${ad.category}`.toLowerCase().includes(q));
  }, [ads, query]);

  const metrics = useMemo(() => ({
    active: ads.filter((ad) => status(ad) === "Active").length,
    views: ads.reduce((sum, ad) => sum + ad.views, 0),
    clicks: ads.reduce((sum, ad) => sum + ad.clicks, 0)
  }), [ads]);

  function edit(ad?: Ad) {
    if (!ad) {
      setEditing({ ...emptyForm });
      return;
    }
    setEditing({
      id: ad.id,
      title: ad.title,
      courseName: ad.courseName,
      category: ad.category,
      headline: ad.headline ?? "",
      description: ad.description ?? "",
      imageUrl: ad.imageUrl ?? "",
      originalPrice: ad.originalPrice?.toString() ?? "",
      offerPrice: ad.offerPrice.toString(),
      ctaText: ad.ctaText,
      ctaUrl: ad.ctaUrl,
      featured: ad.featured,
      published: ad.published,
      archived: ad.archived,
      startsAt: toLocalInput(ad.startsAt),
      endsAt: toLocalInput(ad.endsAt)
    });
  }

  async function reload() {
    const response = await fetch("/api/admin/ads");
    if (response.ok) setAds(await response.json());
  }

  async function save() {
    if (!editing) return;
    setBusy(true);
    const payload = {
      title: editing.title,
      courseName: editing.courseName,
      category: editing.category,
      headline: editing.headline || null,
      description: editing.description || null,
      imageUrl: editing.imageUrl || null,
      originalPrice: editing.originalPrice ? Number(editing.originalPrice) : null,
      offerPrice: Number(editing.offerPrice),
      ctaText: editing.ctaText,
      ctaUrl: editing.ctaUrl,
      featured: editing.featured,
      published: editing.published,
      archived: editing.archived,
      startsAt: editing.startsAt ? new Date(editing.startsAt).toISOString() : null,
      endsAt: editing.endsAt ? new Date(editing.endsAt).toISOString() : null
    };

    const response = await fetch(editing.id ? `/api/admin/ads/${editing.id}` : "/api/admin/ads", {
      method: editing.id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    setBusy(false);
    if (!response.ok) {
      alert("تعذر حفظ الإعلان.");
      return;
    }

    setEditing(null);
    await reload();
  }

  async function remove(id: string) {
    if (!confirm("حذف الإعلان؟")) return;
    await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    await reload();
  }

  async function duplicate(id: string) {
    await fetch(`/api/admin/ads/${id}/duplicate`, { method: "POST" });
    await reload();
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10 bg-[#070b14]/85 px-5 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-widest text-violet-400">VIDORA ADS</div>
            <h1 className="text-2xl font-black">Advertisements Manager</h1>
          </div>
          <button onClick={() => edit()} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-bold">
            <Plus size={17} /> إضافة إعلان
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          <Metric icon={<Eye />} label="Active Ads" value={metrics.active} />
          <Metric icon={<BarChart3 />} label="Views" value={metrics.views.toLocaleString()} />
          <Metric icon={<MousePointerClick />} label="Clicks" value={metrics.clicks.toLocaleString()} />
        </section>

        <section className="mt-7 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black">All Advertisements</h2>
              <p className="text-sm text-slate-500">إدارة كاملة من مشروع مستقل وقاعدة D1 مستقلة.</p>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Search size={17} className="text-slate-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="bg-transparent outline-none" />
            </label>
          </div>

          <div className="grid gap-3">
            {filtered.map((ad) => (
              <article key={ad.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 md:grid-cols-[90px_1fr_auto] md:items-center">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-900">
                  {ad.imageUrl ? <img src={ad.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-white/20">V</div>}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{ad.courseName}</h3>
                    {ad.featured && <Star size={15} className="text-amber-300" fill="currentColor" />}
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">{status(ad)}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{ad.title} • {ad.category}</div>
                  <div className="mt-2 text-xs text-slate-600">👁 {ad.views} • 🖱 {ad.clicks} • CTR {ad.views ? ((ad.clicks/ad.views)*100).toFixed(1) : "0.0"}%</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Action icon={<Edit3 size={15} />} onClick={() => edit(ad)}>Edit</Action>
                  <Action icon={<Copy size={15} />} onClick={() => duplicate(ad.id)}>Duplicate</Action>
                  <Action icon={<Trash2 size={15} />} onClick={() => remove(ad.id)}>Delete</Action>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0d1322] p-6 card-glow">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-violet-400">ADVERTISEMENT</div>
                <h2 className="text-2xl font-black">{editing.id ? "تعديل الإعلان" : "إضافة إعلان"}</h2>
              </div>
              <button onClick={() => setEditing(null)} className="grid size-10 place-items-center rounded-xl border border-white/10"><X /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="اسم الإعلان"><input value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})} /></Field>
              <Field label="اسم الكورس"><input value={editing.courseName} onChange={e=>setEditing({...editing,courseName:e.target.value})} /></Field>
              <Field label="التصنيف"><input value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value})} /></Field>
              <Field label="العنوان التسويقي"><input value={editing.headline} onChange={e=>setEditing({...editing,headline:e.target.value})} /></Field>
              <Field label="السعر الأصلي"><input type="number" value={editing.originalPrice} onChange={e=>setEditing({...editing,originalPrice:e.target.value})} /></Field>
              <Field label="سعر العرض"><input type="number" value={editing.offerPrice} onChange={e=>setEditing({...editing,offerPrice:e.target.value})} /></Field>
              <Field label="CTA Text"><input value={editing.ctaText} onChange={e=>setEditing({...editing,ctaText:e.target.value})} /></Field>
              <Field label="CTA URL"><input value={editing.ctaUrl} onChange={e=>setEditing({...editing,ctaUrl:e.target.value})} /></Field>
              <Field label="بداية العرض"><input type="datetime-local" value={editing.startsAt} onChange={e=>setEditing({...editing,startsAt:e.target.value})} /></Field>
              <Field label="نهاية العرض"><input type="datetime-local" value={editing.endsAt} onChange={e=>setEditing({...editing,endsAt:e.target.value})} /></Field>
              <div className="md:col-span-2">
                <Field label="Cloud Image URL">
                  <div className="flex items-center gap-2">
                    <UploadCloud size={18} className="text-violet-400" />
                    <input value={editing.imageUrl} onChange={e=>setEditing({...editing,imageUrl:e.target.value})} placeholder="https://..." />
                  </div>
                </Field>
              </div>
              <div className="md:col-span-2"><Field label="الوصف"><textarea rows={4} value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} /></Field></div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {[
                ["Published","published"],["Featured","featured"],["Archived","archived"]
              ].map(([label,key])=>(
                <label key={key} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(editing[key as keyof FormState])}
                    onChange={e=>setEditing({...editing,[key]:e.target.checked})}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
              <button onClick={() => setEditing(null)} className="rounded-xl border border-white/10 px-4 py-2.5">إلغاء</button>
              <button disabled={busy} onClick={save} className="rounded-xl bg-violet-600 px-5 py-2.5 font-bold disabled:opacity-60">
                {busy ? "..." : "حفظ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><div className="text-violet-400">{icon}</div><strong className="mt-3 block text-3xl">{value}</strong><span className="text-sm text-slate-500">{label}</span></div>;
}

function Action({ icon, children, onClick }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/[0.05]">{icon}{children}</button>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-black/20 [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-white/10 [&_textarea]:bg-black/20 [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none">
        {children}
      </div>
    </label>
  );
}
