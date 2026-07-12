import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import {
  verifySecretGrant,
  signGateToken,
  gateCookieName,
} from "@/lib/content/lecture-access";

export const runtime = "nodejs";

const bodySchema = z.object({
  slug: z.string().min(1),
  code: z.string().min(1),
  key: z.string().min(1),
});

/** 시크릿키 검증 — 성공 시 강의별 HMAC 서명 쿠키 발급. (공개 엔드포인트) */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const { slug, code, key } = parsed.data;

  await connectDB();
  const lecture = await Content.findOne({ slug, type: "lecture", deletedAt: null })
    .select("_id")
    .lean();
  // 강의 유무를 노출하지 않도록 동일한 실패 응답 사용
  if (!lecture) {
    return NextResponse.json({ error: "인증에 실패했습니다." }, { status: 401 });
  }
  const contentId = String(lecture._id);

  const { ok, ttlMs } = await verifySecretGrant(code, key, contentId);
  if (!ok) {
    return NextResponse.json({ error: "인증에 실패했습니다." }, { status: 401 });
  }

  const exp = Date.now() + ttlMs;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(gateCookieName(contentId), signGateToken(contentId, exp), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(ttlMs / 1000),
  });
  return res;
}
