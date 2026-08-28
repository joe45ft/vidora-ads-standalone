import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiIssue = {
  field: string;
  message: string;
};

export function rejectCrossOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  try {
    if (new URL(request.url).origin !== new URL(origin).origin) {
      return NextResponse.json(
        { error: "forbidden_origin", message: "الطلب غير مسموح من هذا المصدر." },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "forbidden_origin", message: "مصدر الطلب غير صالح." },
      { status: 403 }
    );
  }

  return null;
}

export function apiError(error: unknown, fallback = "حدث خطأ غير متوقع.") {
  console.error("API error:", error);

  if (error instanceof ZodError) {
    const issues: ApiIssue[] = error.issues.map((issue) => ({
      field: issue.path.join(".") || "form",
      message: issue.message
    }));

    return NextResponse.json(
      {
        error: "invalid_input",
        message: "راجع بيانات الإعلان وحاول مرة أخرى.",
        issues
      },
      { status: 422 }
    );
  }

  const message = error instanceof Error ? error.message : String(error);

  if (
    /D1|no such table|database|prepare|SQLITE|binding/i.test(message)
  ) {
    return NextResponse.json(
      {
        error: "database_error",
        message: "تعذر الوصول إلى قاعدة البيانات. أعد المحاولة بعد لحظات."
      },
      { status: 503 }
    );
  }

  if (/CTA_URL_REQUIRED/i.test(message)) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: "رابط التسجيل مطلوب عند نشر الإعلان.",
        issues: [{ field: "ctaUrl", message: "أدخل رابط تسجيل صحيح يبدأ بـ https://" }]
      },
      { status: 422 }
    );
  }

  if (/IMAGE_URL_INVALID/i.test(message)) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: "رابط صورة الإعلان غير صالح.",
        issues: [{ field: "imageUrl", message: "استخدم رابط صورة عام يبدأ بـ https://" }]
      },
      { status: 422 }
    );
  }

  if (/CTA_URL_INVALID/i.test(message)) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: "رابط التسجيل غير صالح.",
        issues: [{ field: "ctaUrl", message: "استخدم رابط http أو https صالحًا." }]
      },
      { status: 422 }
    );
  }

  return NextResponse.json(
    { error: "server_error", message: fallback },
    { status: 500 }
  );
}
