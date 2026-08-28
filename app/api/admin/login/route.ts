import { NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/api-utils";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth";
import {
  ensureRecoveryCode,
  getAdminLoginState,
  isAdminConfigured,
  registerLoginFailure,
  registerLoginSuccess
} from "@/lib/admin-settings";

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
    const clientId =
      request.headers.get("CF-Connecting-IP") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const loginState = await getAdminLoginState(clientId);
    if (loginState.locked) {
      return NextResponse.json(
        {
          error: "temporarily_locked",
          message: `محاولات كثيرة غير صحيحة. جرّب بعد ${Math.max(1, Math.ceil(loginState.retryAfterSeconds / 60))} دقيقة.`,
          retryAfterSeconds: loginState.retryAfterSeconds
        },
        {
          status: 429,
          headers: { "Retry-After": String(loginState.retryAfterSeconds) }
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = String(body.password ?? "");
    const rememberMe = Boolean(body.rememberMe);

    if (!password) {
      return NextResponse.json(
        { error: "password_required", message: "أدخل كلمة المرور." },
        { status: 400 }
      );
    }

    const verification = await verifyAdminPassword(password);
    if (!verification.valid) {
      await registerLoginFailure(clientId);
      return NextResponse.json(
        { error: "invalid_credentials", message: "كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    await registerLoginSuccess(clientId);
    const recoveryCode = await ensureRecoveryCode();
    await createAdminSession(rememberMe);

    return NextResponse.json({
      ok: true,
      upgraded: verification.upgraded,
      usedEnvFallback: verification.usedEnvFallback,
      recoveryCode
    });
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json(
      {
        error: "login_failed",
        message: "تعذر تسجيل الدخول بسبب خطأ في إعدادات الإدارة أو قاعدة البيانات. أعد المحاولة بعد تحديث الصفحة."
      },
      { status: 500 }
    );
  }
}
