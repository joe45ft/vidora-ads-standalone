import { NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/api-utils";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth";
import { isAdminConfigured } from "@/lib/admin-settings";

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  try {
    if (!(await isAdminConfigured())) {
      return NextResponse.json(
        { error: "not_configured", message: "إعداد الإدارة لم يكتمل بعد." },
        { status: 409 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = String(body.password ?? "");

    if (!password || !(await verifyAdminPassword(password))) {
      return NextResponse.json(
        { error: "invalid_credentials", message: "كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json(
      { error: "login_failed", message: "تعذر تسجيل الدخول حاليًا." },
      { status: 500 }
    );
  }
}
