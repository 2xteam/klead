import Link from "next/link";
import Image from "next/image";
import {
  brandAssets,
  footerCourseLinks,
  footerPageLinks,
  pageHero,
} from "@/config/site";
import { Reveal } from "@/components/common/reveal";

const contactCards = [
  {
    title: "파트너쉽 / 강의 문의",
    value: brandAssets.sns.email,
    action: "메일 보내기",
    href: `mailto:${brandAssets.sns.email}`,
  },
  {
    title: "인스타그램",
    value: "@klead_official",
    action: "인스타그램 방문하기",
    href: brandAssets.sns.instagram,
  },
  {
    title: "카톡채널 문의하기",
    value: brandAssets.sns.kakao,
    action: "문의하기",
    href: brandAssets.sns.kakao,
  },
];

export function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Contact us */}
      <div className="mx-auto max-w-[1280px] px-4 pt-20 lg:px-6">
        <Reveal>
          <h2 className="mb-8 text-[28px] font-bold">Contact us.</h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {contactCards.map((c, i) => (
            <Reveal key={c.title} delay={i * 90}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group block rounded-xl bg-[#1c1c1c] p-6 transition-colors hover:bg-[#262626]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-[16px] font-bold">{c.title}</span>
                  <span className="text-[18px] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                    ↗
                  </span>
                </div>
                <p className="mb-3 break-all text-[13px] text-[#8a8a8a]">
                  {c.value}
                </p>
                <p className="text-[13px] font-semibold text-[#d4d4d4]">
                  {c.action}
                </p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Footer main */}
      <div className="mx-auto max-w-[1280px] px-4 py-20 lg:px-6">
        <Reveal>
          <Image
            src={pageHero.logoWhite}
            alt="KLEAD"
            width={200}
            height={80}
            className="mb-14 h-auto w-[160px]"
          />
        </Reveal>

        <div className="grid gap-10 border-t border-[#333] pt-10 md:grid-cols-3">
          <Reveal>
            <p className="mb-4 text-[15px] font-semibold text-[#a9a9a9]">
              @KLEAD_OFFICIAL
            </p>
            <div className="space-y-2 text-[13px] leading-8 text-[#979797]">
              <a href={brandAssets.sns.youtube} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:text-white">
                Youtube ↗
              </a>
              <a href={brandAssets.sns.instagram} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:text-white">
                Instagram ↗
              </a>
              <a href={brandAssets.sns.kakao} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:text-white">
                Kakao ↗
              </a>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <p className="mb-4 text-[15px] font-semibold text-[#a9a9a9]">
              강의 종목 바로가기
            </p>
            <div className="space-y-2 text-[13px] leading-8 text-[#979797]">
              {footerCourseLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal delay={180}>
            <p className="mb-4 text-[15px] font-semibold text-[#a9a9a9]">
              페이지 바로가기
            </p>
            <div className="space-y-2 text-[13px] leading-8 text-[#979797]">
              {footerPageLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-12 space-y-2 text-[13px] leading-relaxed text-[#6f6f6f]">
            <p>
              <span className="mr-4">상호명: 클리드 : KLEAD</span>
              <span>대표자: 김보령</span>
            </p>
            <p>대표자 이메일: queenseohj891121@gmail.com</p>
            <p className="pt-4 text-[#4b4b4b]">@2026 KLEAD. All rights reserved.</p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
