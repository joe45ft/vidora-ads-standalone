import { NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/api-utils";
import { createAdminSession } from "@/lib/auth";
import { isAdminConfigured, recoverAdminPassword } from "@/lib/admin-settings";

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  try {
    if (!(await isAdminConfigured())) {
      return NextResponse.json({ error: "not_configured" }, { status: 409 });
    }

    const body = await request.json().catch(() => ({}));
    const recoveryCode = String(body.recoveryCode ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "invalid_password", message: "كلمة المرور الجديدة يجب أن تكون من 8 إلى 128 حرفًا." },
        { status: 400 }
      );
    }

    const result = await recoverAdminPassword(recoveryCode, newPassword);
    if (!result) {
      return NextResponse.json(
        { error: "invalid_recovery_code", message: "كود الاسترجاع غير صحيح." },
        { status: 401 }
      );
    }

    await createAdminSession(false);
    return NextResponse.json({ ok: true, recoveryCode: result.recoveryCode });
  } catch (error) {
    console.error("Admin recovery failed:", error);
    return NextResponse.json(
      { error: "recovery_failed", message: "تعذر استرجاع حساب الإدارة حاليًا." },
      { status: 500 }
    );
  }
}
