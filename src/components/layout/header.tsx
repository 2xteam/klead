"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { brandAssets, pageHero } from "@/config/site";
import type { NavItem } from "@/config/site";
import { DesktopNav, MobileNav } from "@/components/layout/navigation";

interface DemoMember {
  id: string;
  name: string;
  role: string;
}

function readMemberCookie(): DemoMember | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie
    .split("; ")
    .find((c) => c.startsWith("klead_member="));
  if (!m) return null;
  let v = m.substring("klead_member=".length);
  // 인코딩 횟수에 무관하게 파싱될 때까지 반복 디코드
  for (let i = 0; i < 3; i++) {
    try {
      return JSON.parse(v) as DemoMember;
    } catch {
      try {
        v = decodeURIComponent(v);
      } catch {
        break;
      }
    }
  }
  return null;
}

export function Header({ nav }: { nav: NavItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [member, setMember] = useState<DemoMember | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = nav;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMember(readMemberCookie()));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  async function logout() {
    await fetch("/api/dev-login", { method: "DELETE" });
    setMember(null);
    router.refresh();
  }

  // 클리드/테크 큐레이터 페이지: 헤더를 헤로 이미지 위에 투명 오버레이
  const overlay =
    pathname === "/about" ||
    pathname === "/curators" ||
    pathname.startsWith("/curators/") ||
    pathname === "/courses" ||
    pathname === "/programs" ||
    pathname.startsWith("/programs/");

  return (
    <>
      <header
        className={
          overlay
            ? "absolute inset-x-0 top-0 z-40 [&_a]:text-white [&_button]:text-white [&_span]:bg-white"
            : "sticky top-0 z-40 border-b border-[#f0f0f0] bg-white"
        }
      >
        <div className="mx-auto flex h-[70px] max-w-[1280px] items-center justify-between px-4 lg:px-6">
          <Link href="/" className="shrink-0">
            <Image
              src={overlay ? pageHero.logoWhite : brandAssets.logo.default}
              alt="클리드 : 뷰티양성교육기관"
              width={115}
              height={40}
              className="hidden h-auto w-[115px] lg:block"
              priority
            />
            <Image
              src={overlay ? pageHero.logoWhite : brandAssets.logo.mobile}
              alt="클리드 : 뷰티양성교육기관"
              width={100}
              height={36}
              className="h-auto w-[100px] lg:hidden"
              priority
            />
          </Link>

          <DesktopNav items={navItems} />

          <div className="flex items-center gap-3">
            {member ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/mypage"
                  className="text-[14px] text-[#161616] transition-colors hover:text-klead-primary"
                >
                  마이페이지
                </Link>
                <button
                  onClick={logout}
                  className="text-[14px] text-[#161616] transition-colors hover:text-klead-primary"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[14px] text-[#161616] transition-colors hover:text-klead-primary"
              >
                로그인
              </Link>
            )}

            <button
              type="button"
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="메뉴 열기"
            >
              <span className="block h-0.5 w-5 bg-black" />
              <span className="block h-0.5 w-5 bg-black" />
              <span className="block h-0.5 w-5 bg-black" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        items={navItems}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}
