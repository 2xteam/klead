import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { User } from "@/lib/db/models";

/**
 * 개발용 임시 로그인 — 테스트 회원을 선택해 로그인 상태를 시뮬레이션.
 * (카카오 로그인은 2차 개발. 클라이언트에게 회원별 화면을 시연하기 위한 임시 기능)
 */
export const MEMBER_COOKIE = "klead_member";

const bodySchema = z.object({ userId: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "userId 필요" }, { status: 400 });
  }
  await connectDB();
  const u = await User.findById(parsed.data.userId)
    .select("name role status")
    .lean();
  if (!u) {
    return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
  }
  // Next가 쿠키 값을 자동 인코딩하므로 여기서는 순수 JSON 문자열만 저장(이중 인코딩 방지)
  const value = JSON.stringify({
    id: String(u._id),
    name: u.name,
    role: u.role,
  });
  const res = NextResponse.json({ ok: true, name: u.name, role: u.role });
  // 데모용: 클라이언트에서 읽어 헤더에 표시해야 하므로 httpOnly=false
  res.cookies.set(MEMBER_COOKIE, value, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
