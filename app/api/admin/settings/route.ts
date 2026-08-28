import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/api-utils";
import { getSiteSettings, updateSiteSettings } from "@/lib/site-settings";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ settings: await getSiteSettings() });
}

export async function PUT(request: Request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const settings = await updateSiteSettings(await request.json());
    return NextResponse.json({ settings });
  } catch (error) {
    const message = String(error);

    if (message.includes("INVALID_LOGO_URL")) {
      return NextResponse.json(
        { error: "invalid_logo_url", message: "رابط الشعار يجب أن يكون رابط HTTPS عام لصورة." },
        { status: 400 }
      );
    }

    if (message.includes("INVALID_SUPPORT_URL")) {
      return NextResponse.json(
        { error: "invalid_support_url", message: "تأكد من صحة رابط Contact / Support." },
        { status: 400 }
      );
    }

    console.error("Site settings update failed:", error);
    return NextResponse.json(
      { error: "settings_update_failed", message: "تعذر حفظ إعدادات الموقع." },
      { status: 500 }
    );
  }
}
