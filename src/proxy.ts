import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminCookie } from "@/lib/admin/auth";

/**
 * /admin/* 및 /api/admin/* 보호. 로그인 경로는 예외.
 * (Next.js 16: middleware → proxy 규약)
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 예외: 로그인 화면 + 로그인 API
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  const ok = await isValidAdminCookie(cookie);
  if (ok) return NextResponse.next();

  // API는 401 JSON, 페이지는 로그인으로 리다이렉트
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
