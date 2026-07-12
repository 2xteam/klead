import { partners } from "@/config/site";
import { Reveal } from "@/components/common/reveal";
import { PartnerSlider } from "@/components/common/partner-slider";

export function PartnersSection() {
  return (
    <section className="relative overflow-hidden bg-[#8a8a8a]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/7614a5ff9f642.jpg)",
        }}
      />
      <div className="relative">
        <div className="mx-auto max-w-[1280px] px-4 py-24 lg:px-6 lg:py-28">
          <Reveal>
            <p className="mb-3 text-center text-[21px] font-medium text-white/70">
              성공 파트너 클리드
            </p>
            <h2 className="mb-16 text-center text-[36px] font-bold text-white sm:text-[45px]">
              클리드와 함께하는 파트너
            </h2>
          </Reveal>
        </div>
        {/* 로고 슬라이더는 화면 전체 너비 */}
        <PartnerSlider
          items={partners.map((p) => ({ imageUrl: p.image, alt: p.name }))}
        />
      </div>
    </section>
  );
}
