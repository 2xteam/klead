import { NextResponse, type NextRequest } from "next/server";

const MEMBER_COOKIE = "klead_member";

/**
 * /admin/* 및 /api/admin/* 보호 — 관리자(role=admin)로 로그인한 계정만 허용.
 * (Next.js 16: middleware → proxy 규약)
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let isAdmin = false;
  const cookie = req.cookies.get(MEMBER_COOKIE)?.value;
  if (cookie) {
    try {
      const m = JSON.parse(decodeURIComponent(cookie)) as { role?: string };
      isAdmin = m.role === "admin";
    } catch {
      isAdmin = false;
    }
  }
  if (isAdmin) return NextResponse.next();

  // API는 401, 페이지는 로그인으로
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
