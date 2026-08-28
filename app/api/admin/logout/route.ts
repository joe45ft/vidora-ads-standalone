import { NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/api-utils";
import { destroyAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  await destroyAdminSession();
  return NextResponse.json({ ok: true });
}
