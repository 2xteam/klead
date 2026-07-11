import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/common/reveal";

export const metadata = {
  title: "클리드 소개 | 클리드",
  description:
    "KLEAD는 단순 기술 교육이 아닌, 현장에서 살아남고 성장하는 전문가를 양성하는 실무형 교육기관입니다.",
};

export default function AboutPage() {
  return (
    <div>
      <PageHero
        variant="brand"
        eyebrow="ABOUT KLEAD"
        title="클리드"
        description="Beauty Mastery Academy"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-[900px] px-4 py-20 text-center lg:px-6 lg:py-28">
          <Reveal>
            <h2 className="mb-8 text-[24px] font-bold leading-snug sm:text-[32px]">
              클리드는 단순히 기술을 배우는 곳이 아닙니다.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="whitespace-pre-line text-[16px] leading-9 text-klead-gray-500">
              현장 실무 경험과 교육 설계를 기반으로, 실제 뷰티 산업에서 살아남고
              성장할 수 있는 전문가를 양성하는 실무형 교육기관입니다.{"\n"}
              배움 → 실전 → 브랜딩 → 창업 → 매출 → 확장까지 끝까지 책임지는 성과
              중심 아카데미입니다.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0e0e0e] text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-20 lg:px-6 lg:py-24">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "학습자 중심", d: "대상에 따라 다른 수업 커리큘럼" },
              { t: "실전 중심", d: "교육안·PPT·수업·실연까지 직접 수행" },
              { t: "상호작용 기반", d: "질문·피드백·코칭 중심 교육" },
              { t: "성과 기반", d: "완성된 강의안과 실연 능력으로 평가" },
            ].map((v, i) => (
              <Reveal key={v.t} delay={i * 120} as="div">
                <div className="min-h-[160px] rounded-lg bg-black p-6">
                  <h3 className="mb-3 text-[18px] font-bold">{v.t}</h3>
                  <p className="text-[14px] leading-relaxed text-[#dedede]">
                    {v.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
