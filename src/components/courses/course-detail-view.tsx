import Image from "next/image";
import type { IPageSection } from "@/lib/db/models/content";
import { brandAssets } from "@/config/site";

export interface CourseDetailData {
  title: string;
  summary?: string;
  thumbnail?: string;
  lectureCategory?: string;
  priceDisplay?: string;
  sections: IPageSection[];
}

const CATEGORY_LABEL: Record<string, string> = {
  waxing: "왁싱",
  eyebrow: "눈썹",
  scalp: "두피관리",
  face_design: "페이스디자인",
  skin_care: "피부관리",
  body_care: "바디관리",
  theory: "이론",
  business: "경영",
};

function PriceLabel({ priceDisplay }: { priceDisplay?: string }) {
  const text =
    priceDisplay === "free"
      ? "무료"
      : priceDisplay === "amount"
        ? "유료"
        : "가격문의";
  return <span>{text}</span>;
}

function InsightSection({ section }: { section: IPageSection }) {
  if (!section.items?.length) return null;
  return (
    <section className="bg-[#0e0e0e] text-white">
      <div className="mx-auto max-w-[1000px] px-4 py-16 lg:px-6 lg:py-20">
        <p className="mb-8 text-center text-[14px] tracking-widest text-[#a9a9a9]">
          {section.title}
        </p>
        <ul className="mx-auto max-w-3xl space-y-4">
          {section.items.map((item) => (
            <li
              key={item.title}
              className="border-l-2 border-klead-primary pl-4 text-[17px] font-semibold leading-relaxed sm:text-[19px]"
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CurriculumSection({ section }: { section: IPageSection }) {
  if (!section.items?.length) return null;
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1000px] px-4 py-16 lg:px-6 lg:py-24">
        <h2 className="mb-12 text-center text-[24px] font-bold sm:text-[30px]">
          {section.title}
        </h2>
        <ol className="space-y-8">
          {section.items.map((item, i) => (
            <li key={item.title} className="flex gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-[15px] font-bold text-white">
                {i + 1}
              </div>
              <div className="flex-1 border-b border-black/10 pb-8">
                <h3 className="mb-1 text-[19px] font-bold">{item.title}</h3>
                {item.subtitle && (
                  <p className="mb-3 text-[15px] font-semibold text-klead-primary">
                    {item.subtitle}
                  </p>
                )}
                {item.bullets?.length ? (
                  <ul className="mb-3 list-inside list-disc space-y-1 text-[14px] text-klead-gray-500">
                    {item.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {item.description && (
                  <p className="whitespace-pre-line text-[14px] leading-relaxed text-klead-gray-500">
                    {item.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PhilosophySection({ section }: { section: IPageSection }) {
  if (!section.items?.length) return null;
  return (
    <section className="bg-[#0e0e0e] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-16 lg:px-6 lg:py-24">
        <h2 className="mb-12 text-center text-[22px] font-bold sm:text-[26px]">
          {section.title}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item) => (
            <div key={item.title} className="min-h-[160px] bg-black p-6">
              <h3 className="mb-3 text-[18px] font-bold">{item.title}</h3>
              <p className="text-[14px] leading-relaxed text-[#dedede]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CourseDetailView({ course }: { course: CourseDetailData }) {
  const sorted = [...course.sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#111]">
        {course.thumbnail && (
          <div className="absolute inset-0">
            <Image
              src={course.thumbnail}
              alt=""
              fill
              className="object-cover opacity-30"
              sizes="100vw"
              priority
            />
          </div>
        )}
        <div className="relative mx-auto max-w-[1000px] px-4 py-24 text-center text-white lg:px-6 lg:py-32">
          {course.lectureCategory && (
            <p className="mb-4 text-[14px] tracking-widest text-klead-primary">
              {CATEGORY_LABEL[course.lectureCategory] ?? course.lectureCategory}
            </p>
          )}
          <h1 className="mb-5 text-[28px] font-bold leading-snug sm:text-[38px]">
            {course.title}
          </h1>
          {course.summary && (
            <p className="mx-auto max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-[#d4d4d4]">
              {course.summary}
            </p>
          )}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="rounded-full bg-white/10 px-5 py-2 text-[14px] font-semibold">
              <PriceLabel priceDisplay={course.priceDisplay} />
            </span>
            <a
              href={brandAssets.sns.kakao}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-klead-primary px-6 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              수강 문의
            </a>
          </div>
        </div>
      </section>

      {sorted.map((section) => {
        switch (section.key) {
          case "insight":
            return <InsightSection key={section.key} section={section} />;
          case "curriculum":
            return <CurriculumSection key={section.key} section={section} />;
          case "philosophy":
            return <PhilosophySection key={section.key} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
