"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 스크롤로 화면에 들어오면 하단에서 올라오며 나타나는 래퍼(fade-in-up).
 * 푸터·lazy 섹션 등에 사용.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    // 화면에 들어오면 등장, 벗어나면 다시 숨김 → 재진입 시 다시 애니메이션
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          setShown(e.isIntersecting);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error polymorphic ref
      ref={ref}
      className={className}
      style={{
        // 2배 느린 등장(1.4s)
        transition:
          "opacity 1.4s cubic-bezier(0.16,1,0.3,1), transform 1.4s cubic-bezier(0.16,1,0.3,1)",
        transitionDelay: `${delay}ms`,
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(40px)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
