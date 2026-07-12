import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/common/reveal";
import { SectionRenderer } from "@/components/content/section-renderer";
import { hydrateBannerSections } from "@/lib/content/hydrate-sections";
import connectDB from "@/lib/db/mongodb";
import { Banner } from "@/lib/db/models";
import type { IPageSection } from "@/lib/db/models/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "클리드 소개 | 클리드",
  description:
    "KLEAD는 단순 기술 교육이 아닌, 현장에서 살아남고 성장하는 전문가를 양성하는 실무형 교육기관입니다.",
};

const R2 = "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/about";

const talents = [
  ["기술보다", "태도가 먼저인 사람"],
  ["혼자 기술자가 아닌,", "브랜드 오너로 성장하는 사람"],
  ["교육자, 리더, 창업가로서", "시장을 이끄는 사람"],
  ["콘텐츠, 브랜딩, 비즈니스를", "설계할 줄 아는 사람"],
];

async function getPartnerBannerSections(): Promise<IPageSection[]> {
  await connectDB();
  const banner = await Banner.findOne({ name: "파트너사 배너" })
    .select("_id")
    .lean();
  if (!banner) return [];
  return hydrateBannerSections([
    {
      key: "partners",
      type: "banner",
      bannerId: String(banner._id),
      sortOrder: 0,
    },
  ]);
}

export default async function AboutPage() {
  const bannerSections = await getPartnerBannerSections();
  return (
    <div>
      <PageHero
        variant="brand"
        eyebrow="ABOUT KLEAD"
        title="클리드"
        description="Beauty Mastery Academy"
      />

      {/* Section 1 — 인재상 */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-24 lg:px-6 lg:py-32">
          <Reveal>
            <h2 className="text-center text-[26px] font-bold">
              클리드가 만들고자 하는 인재상
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 text-center text-[16px] leading-relaxed text-klead-gray-500">
              브랜드는 만드는 것이 아니라 설계하는 것입니다.
              <br />
              클리드는 설계할 줄 아는 인재로 만듭니다.
            </p>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {talents.map((t, i) => (
              <Reveal key={t[1]} delay={i * 120} as="div">
                <div className="flex min-h-[110px] items-center justify-center rounded-[20px] border border-black/85 px-6 py-8 text-center leading-tight">
                  <span>
                    <span className="block text-[18px] text-klead-gray-800">
                      {t[0]}
                    </span>
                    <span className="mt-1 block text-[18px] font-bold text-black">
                      {t[1]}
                    </span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — 소속이 되는 순간 (grayscale bg) */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center"
          style={{ backgroundImage: `url(${R2}/about-bg-strong-gray.jpg)` }}
        />
        <div className="absolute inset-0 bg-[rgba(61,61,61,0.85)]" />
        <div className="relative mx-auto max-w-[1280px] px-4 py-20 text-center text-white lg:px-6">
          <Reveal>
            <p className="text-[16px] leading-8">
              클리드의 소속이 되는 순간
              <br />
              누구도 범접할 수 없는 전문 강사가 됩니다.
            </p>
            <p className="mt-6 text-[16px] leading-8">
              기술만 가르치지 않습니다.
              <br />
              말 잘하는 법만 가르치지도 않습니다.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <span className="mx-auto my-8 block h-[3px] w-12 bg-white" />
            <p className="text-[16px] font-bold underline underline-offset-4">
              전문성 + 커리큘럼 + 브랜딩 + 실전 평가
            </p>
            <p className="mt-2 text-[15px]">
              이 네 가지를 모두 갖춘 사람만 강사라 부를 수 있습니다.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Section 3 — 파트너사 배너 (배너 관리에서 관리) */}
      <SectionRenderer sections={bannerSections} />
    </div>
  );
}
