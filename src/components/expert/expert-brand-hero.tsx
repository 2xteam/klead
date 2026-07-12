"use client";

import { useEffect, useState } from "react";
import type { IPageSectionItem } from "@/lib/db/models/content";

type Variant = "filled" | "outline" | "muted";

interface Pill {
  label: string;
  variant: Variant;
  x: number; // % — 알약 '중심'의 좌표
  y: number; // %
}

/** meta에 위치/스타일이 없을 때 사용하는 기본 배치(중심 좌표, 이미지 #1 기준) */
const FALLBACK: Omit<Pill, "label">[] = [
  { variant: "outline", x: 16, y: 36 }, // Knowledge
  { variant: "filled", x: 47, y: 23 }, // Leadership
  { variant: "outline", x: 82, y: 38 }, // Direction
  { variant: "filled", x: 15, y: 63 }, // Aesthetic
  { variant: "outline", x: 62, y: 76 }, // Enterpreneurship
  { variant: "muted", x: 82, y: 63 }, // CLASS+
  { variant: "muted", x: 16, y: 78 }, // CLASS+
];

function toPills(items: IPageSectionItem[]): Pill[] {
  return items.map((it, i) => {
    const m = (it.meta ?? {}) as Record<string, unknown>;
    const fb = FALLBACK[i % FALLBACK.length];
    return {
      label: it.title ?? "",
      variant: (typeof m.variant === "string" ? m.variant : fb.variant) as Variant,
      x: typeof m.x === "number" ? m.x : fb.x,
      y: typeof m.y === "number" ? m.y : fb.y,
    };
  });
}

const VARIANT_CLS: Record<Variant, string> = {
  filled: "bg-[#161616] text-white border border-[#161616] shadow-lg",
  outline: "bg-white text-[#161616] border border-black/12 shadow-sm",
  muted: "bg-white text-black/25 border border-black/[0.06]",
};

export function ExpertBrandHero({
  eyebrow,
  heading,
  sub,
  items,
}: {
  eyebrow?: string;
  heading?: string;
  sub?: string;
  items: IPageSectionItem[];
}) {
  const pills = toPills(items);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-24 lg:grid-cols-2 lg:px-6 lg:py-28">
        {/* 좌: 카피 */}
        <div>
          {eyebrow && (
            <p className="mb-8 text-[13px] font-medium tracking-[0.2em] text-klead-gray-400">
              {eyebrow}
            </p>
          )}
          <h1 className="whitespace-pre-line text-[30px] font-bold leading-[1.5] text-[#161616] sm:text-[38px]">
            {heading}
          </h1>
          {sub && (
            <p className="mt-8 whitespace-pre-line text-[15px] leading-[1.9] text-klead-gray-500">
              {sub}
            </p>
          )}
        </div>

        {/* 우: 라운딩 키워드 클라우드 — 중심 좌표 기준 배치(넘침 방지), 첫 로딩에 순차 등장 */}
        <div className="relative h-[420px] w-full sm:h-[540px]" aria-hidden="true">
          {pills.map((p, i) => (
            <span
              key={`${p.label}-${i}`}
              className={`absolute whitespace-nowrap rounded-full px-12 py-3 text-[15px] font-semibold sm:text-[16px] ${VARIANT_CLS[p.variant]}`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transition:
                  "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                transitionDelay: `${i * 140}ms`,
                opacity: shown ? 1 : 0,
                transform: shown
                  ? "translate(-50%, -50%)"
                  : "translate(-50%, calc(-50% + 28px))",
                willChange: "opacity, transform",
              }}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
