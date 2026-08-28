import { NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/api-utils";
import { createAdminSession, isAdminAuthenticated } from "@/lib/auth";
import { changeAdminPassword } from "@/lib/admin-settings";

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "invalid_password", message: "كلمة المرور الجديدة يجب أن تكون من 8 إلى 128 حرفًا." },
        { status: 400 }
      );
    }

    const result = await changeAdminPassword(currentPassword, newPassword);
    if (!result) {
      return NextResponse.json(
        { error: "invalid_current_password", message: "كلمة المرور الحالية غير صحيحة." },
        { status: 401 }
      );
    }

    await createAdminSession(false);
    return NextResponse.json({ ok: true, recoveryCode: result.recoveryCode });
  } catch (error) {
    console.error("Admin security update failed:", error);
    return NextResponse.json(
      { error: "security_update_failed", message: "تعذر تحديث كلمة المرور حاليًا." },
      { status: 500 }
    );
  }
}
