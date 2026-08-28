import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!verifyAdminPassword(String(body.password ?? ""))) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
