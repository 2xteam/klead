import Image from "next/image";
import type { IPageSection } from "@/lib/db/models/content";
import { Reveal } from "@/components/common/reveal";
import { ExpertBrandHero } from "@/components/expert/expert-brand-hero";
import { SectionRenderer } from "@/components/content/section-renderer";

/** 다크 섹션 상단의 알약형 배지 */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-white px-5 py-2 text-[13px] font-bold text-[#161616]">
      {children}
    </span>
  );
}

/** 핵심가치 카드용 기하학 아이콘 (라인) */
function ValueIcon({ i }: { i: number }) {
  const icons = [
    <path key="d" d="M16 3 L29 16 L16 29 L3 16 Z" />,
    <path key="dd" d="M16 3 L29 16 L16 29 L3 16 Z M16 9 L23 16 L16 23 L9 16 Z" />,
    <g key="c">
      <circle cx="10" cy="16" r="7" />
      <circle cx="16" cy="16" r="7" />
      <circle cx="22" cy="16" r="7" />
    </g>,
    <g key="w">
      <path d="M2 12 Q9 7 16 12 T30 12" />
      <path d="M2 20 Q9 15 16 20 T30 20" />
    </g>,
  ];
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    >
      {icons[i % icons.length]}
    </svg>
  );
}

/** 섹션 1 — ABOUT KLEAD + 키워드 클라우드 */
function SectionBrand({ section }: { section: IPageSection }) {
  return (
    <ExpertBrandHero
      eyebrow={section.title}
      heading={section.subtitle}
      sub={section.body}
      items={section.items ?? []}
    />
  );
}

/** 섹션 2 — 핵심가치 (다크) — 상단 양쪽 모서리만 라운딩 */
function SectionValues({ section }: { section: IPageSection }) {
  return (
    <section className="relative overflow-hidden rounded-t-[48px] bg-[#0c0c0c] text-white">
      {section.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${section.backgroundImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative mx-auto max-w-[1280px] px-4 py-24 lg:px-6 lg:py-28">
        <Reveal>
          <Badge>핵심가치</Badge>
          <h2 className="mt-6 text-[24px] font-bold sm:text-[30px]">
            {section.title}
          </h2>
          <p className="mt-5 max-w-2xl whitespace-pre-line text-[14px] leading-[1.9] text-white/60">
            {section.body}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {section.items?.map((item, i) => (
            <Reveal key={item.title} delay={i * 90}>
              <div className="min-h-[210px] rounded-2xl border border-white/10 bg-black/60 p-8">
                <span className="text-white/80">
                  <ValueIcon i={i} />
                </span>
                <h3 className="mt-8 text-[19px] font-bold">{item.title}</h3>
                <p className="mt-4 whitespace-pre-line text-[14px] leading-[1.8] text-white/70">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 섹션 3 — 대표 소개 (좌우 교차 밴드) — 패딩 없이 다음 섹션과 밀착 */
function SectionLeaders({ section }: { section: IPageSection }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] space-y-16 px-4 pt-24 lg:px-6 lg:pt-28 lg:space-y-24">
        {section.items?.map((item, i) => {
          const imageRight = i % 2 === 1;
          return (
            <Reveal key={item.title}>
              <article
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12 ${
                  imageRight ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* 인물 — 잉크 스플래시가 포함된 원본 이미지를 그대로, 영역을 꽉 채워 노출 */}
                <div className="flex justify-center">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.title ?? ""}
                      width={720}
                      height={684}
                      className="h-auto w-full"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                </div>

                {/* 텍스트 */}
                <div className={imageRight ? "lg:text-right" : ""}>
                  <h3 className="whitespace-pre-line text-[22px] font-bold leading-snug text-[#161616] sm:text-[28px]">
                    {item.subtitle}
                  </h3>
                  <p className="mt-5 text-[16px] font-bold text-[#161616]">
                    {item.title}
                  </p>
                  <div className="mt-4 space-y-1">
                    {item.bullets?.map((b) => (
                      <p key={b} className="text-[14px] font-semibold text-klead-gray-800">
                        {b}
                      </p>
                    ))}
                  </div>
                  <p className="mt-5 whitespace-pre-line text-[14px] leading-[1.9] text-klead-gray-500">
                    {item.description}
                  </p>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/** 섹션 4 — MISSION / 4단계 성장 구조 (다크) */
function SectionCurriculum({ section }: { section: IPageSection }) {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      {section.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${section.backgroundImage})` }}
        />
      )}
      <div className="relative mx-auto max-w-[1280px] px-4 py-24 lg:px-6 lg:py-28">
        <Reveal>
          <Badge>MISSION</Badge>
          <h2 className="mt-6 text-[24px] font-bold sm:text-[30px]">
            {section.title}
          </h2>
          <p className="text-[24px] font-bold sm:text-[30px]">
            {section.subtitle}
          </p>
          <p className="mt-6 max-w-2xl whitespace-pre-line text-[15px] leading-[1.9] text-white/60">
            {section.body}
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.items?.map((item, i) => {
            const [num, ...rest] = (item.title ?? "").split(" ");
            const heading = rest.join(" ");
            return (
              <Reveal key={item.title} delay={i * 90}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                  <p className="text-center text-[13px] font-bold text-white/40">
                    {num}
                  </p>
                  <h3 className="mt-1 whitespace-pre-line text-center text-[17px] font-bold leading-snug">
                    {heading}
                  </h3>
                  <hr className="my-5 border-white/12" />
                  <ul className="space-y-2.5 text-center text-[13.5px] text-white/60">
                    {item.bullets?.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionContact({ section }: { section: IPageSection }) {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-24 lg:px-6 lg:py-28">
        <h2 className="mb-10 text-[26px] font-bold">{section.title}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {section.items?.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white/[0.04] p-7">
              <h3 className="mb-3 text-[19px] font-bold">{item.title}</h3>
              <p className="mb-5 break-all text-[14px] text-white/45">
                {item.description}
              </p>
              {item.linkUrl && (
                <a
                  href={item.linkUrl}
                  target={item.linkUrl.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-[14px] font-semibold text-white/80 transition-colors hover:text-white"
                >
                  {item.linkLabel ?? "바로가기"} →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExpertProgramView({
  title,
  sections,
}: {
  title: string;
  sections: IPageSection[];
}) {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <h1 className="sr-only">{title}</h1>
      {sorted.map((section) => {
        switch (section.key) {
          case "brand":
          case "hero":
            return <SectionBrand key={section.key} section={section} />;
          case "values":
            return <SectionValues key={section.key} section={section} />;
          case "leaders":
            return <SectionLeaders key={section.key} section={section} />;
          case "curriculum":
            return <SectionCurriculum key={section.key} section={section} />;
          case "partners":
            return <SectionRenderer key={section.key} sections={[section]} />;
          case "contact":
            return <SectionContact key={section.key} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
