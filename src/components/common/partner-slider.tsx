"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface PartnerSliderItem {
  imageUrl: string;
  alt: string;
}

/**
 * 파트너 로고 자동 슬라이딩(마퀴) — 오른쪽 → 왼쪽 방향.
 * 속도를 사인곡선으로 변조해 "점점 빨라졌다 점점 느려지는" ease-in-out 반복.
 * 등장은 위로 슬라이드하지 않고 부드럽게 페이드인.
 * prefers-reduced-motion 사용자는 정지.
 */
export function PartnerSlider({ items }: { items: PartnerSliderItem[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fadeRaf = requestAnimationFrame(() => setVisible(true)); // 부드럽게 페이드인
    const track = trackRef.current;
    if (!track) {
      return () => cancelAnimationFrame(fadeRaf);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let raf = 0;
    let offset = 0;
    let last = performance.now();
    const startedAt = last;

    const halfWidth = () => track.scrollWidth / 2;

    // 최대 속도 = 2*BASE. 이전(BASE=55, 최대 110)의 절반 → BASE=27(최대 54).
    const BASE = 27;
    const FREQ = 0.55;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const elapsed = (now - startedAt) / 1000;

      const speed = BASE * (1 + Math.sin(elapsed * FREQ));
      // 오른쪽 → 왼쪽: offset을 감소시켜 왼쪽으로 이동
      offset -= speed * dt;

      const half = halfWidth();
      if (half > 0 && offset <= -half) offset += half;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fadeRaf);
    };
  }, [items]);

  const loop = [...items, ...items];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ transition: "opacity 1.2s ease", opacity: visible ? 1 : 0 }}
    >
      <div
        ref={trackRef}
        className="flex w-max items-center gap-16 will-change-transform sm:gap-24"
      >
        {loop.map((it, i) => (
          <div
            key={i}
            aria-hidden={i >= items.length}
            className="relative flex h-44 w-[450px] shrink-0 items-center justify-center opacity-80 transition-opacity duration-300 hover:opacity-100"
          >
            <Image
              src={it.imageUrl}
              alt={i < items.length ? it.alt : ""}
              width={450}
              height={176}
              className="h-auto max-h-40 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
