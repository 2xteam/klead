"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export interface CourseCard {
  slug: string;
  title: string;
  summary?: string;
  thumbnail?: string;
  lectureCategory?: string;
  priceDisplay?: string;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "waxing", label: "왁싱" },
  { key: "scalp", label: "두피관리" },
  { key: "face_design", label: "페이스디자인" },
  { key: "skin_care", label: "피부관리" },
  { key: "theory", label: "이론" },
  { key: "business", label: "경영" },
];

const CAT_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label]),
);

function priceLabel(p?: string) {
  return p === "free" ? "무료" : p === "amount" ? "유료" : "가격문의";
}

export function CoursesFilter({ courses }: { courses: CourseCard[] }) {
  const params = useSearchParams();
  const initial = params.get("category") ?? "all";
  const [active, setActive] = useState(
    CATEGORIES.some((c) => c.key === initial) ? initial : "all",
  );

  // 데이터에 존재하는 카테고리만 필터 버튼으로 노출(전체 + 보유분)
  const available = useMemo(() => {
    const present = new Set(courses.map((c) => c.lectureCategory).filter(Boolean));
    return CATEGORIES.filter((c) => c.key === "all" || present.has(c.key));
  }, [courses]);

  const filtered = useMemo(
    () => (active === "all" ? courses : courses.filter((c) => c.lectureCategory === active)),
    [courses, active],
  );

  return (
    <div>
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {available.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={
              active === c.key
                ? "rounded-full bg-klead-primary px-5 py-2 text-[14px] font-semibold text-white"
                : "rounded-full border border-black/15 px-5 py-2 text-[14px] font-medium text-klead-gray-500 transition-colors hover:border-black/40 hover:text-klead-gray-900"
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-[15px] text-klead-gray-400">
          해당 종목의 강의가 준비 중입니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.slug}
              href={`/courses/${c.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#111]">
                {c.thumbnail && (
                  <Image
                    src={c.thumbnail}
                    alt={c.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:1024px) 100vw, 400px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="mt-4">
                {c.lectureCategory && (
                  <p className="mb-1 text-[12px] text-klead-primary">
                    {CAT_LABEL[c.lectureCategory] ?? c.lectureCategory}
                  </p>
                )}
                <h3 className="text-[16px] font-bold">
                  {c.title}
                </h3>
                <p className="mt-1 text-[13px] text-klead-gray-500">
                  {priceLabel(c.priceDisplay)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
