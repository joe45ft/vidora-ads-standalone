import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Settings2 } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteSettingsForm } from "@/components/site-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-violet-300">
              <Settings2 size={17} />
              GENERAL SETTINGS
            </div>
            <h1 className="text-3xl font-black">إعدادات الموقع</h1>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-bold"
          >
            الرجوع للإدارة <ArrowRight size={16} />
          </Link>
        </div>

        <SiteSettingsForm initial={settings} />
      </div>
    </main>
  );
}
