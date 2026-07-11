"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { brandAssets, mainNavigation, pageHero } from "@/config/site";
import { DesktopNav, MobileNav } from "@/components/layout/navigation";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // 클리드/테크 큐레이터 페이지: 헤더를 헤로 이미지 위에 투명 오버레이
  const overlay =
    pathname === "/about" ||
    pathname === "/curators" ||
    pathname.startsWith("/curators/");

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

          <DesktopNav items={mainNavigation} />

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[14px] text-[#161616] transition-colors hover:text-klead-primary"
            >
              로그인
            </Link>

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
        items={mainNavigation}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}
