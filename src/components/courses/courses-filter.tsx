"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SquareCourseCard } from "@/components/common/square-course-card";

export interface CourseCard {
  slug: string;
  title: string;
  summary?: string;
  thumbnail?: string;
  lectureCategory?: string;
  priceDisplay?: string;
  locked?: boolean;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "waxing", label: "왁싱" },
  { key: "eyebrow", label: "눈썹" },
  { key: "scalp", label: "두피관리" },
  { key: "face_design", label: "페이스디자인" },
  { key: "skin_care", label: "피부관리" },
  { key: "body_care", label: "바디관리" },
  { key: "theory", label: "이론" },
  { key: "business", label: "경영" },
];

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
            <SquareCourseCard
              key={c.slug}
              href={c.locked ? `/courses/${c.slug}` : `/lecture/${c.slug}`}
              title={c.title}
              image={c.thumbnail}
              subtitle={c.summary}
              locked={c.locked}
              productHref={`/courses/${c.slug}`}
              subscribeHref="/programs"
            />
          ))}
        </div>
      )}
    </div>
  );
}
