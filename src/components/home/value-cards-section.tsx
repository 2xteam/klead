import Image from "next/image";
import Link from "next/link";
import { brandAssets } from "@/config/site";
import { Reveal } from "@/components/common/reveal";

const cards = [
  { ...brandAssets.valueCards.learner, delay: 0, offset: false },
  { ...brandAssets.valueCards.practice, delay: 200, offset: true },
  { ...brandAssets.valueCards.interaction, delay: 400, offset: false },
  { ...brandAssets.valueCards.result, delay: 600, offset: true },
];

export function ValueCardsSection() {
  return (
    <section className="relative z-10 -mt-10 rounded-t-[40px] bg-white pt-16 lg:pt-20">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
        {/* 인트로 */}
        <Reveal>
          <p className="mb-3 text-[15px] text-klead-gray-500">
            클리드 실전형 교육자 양성 과정
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="mb-16 text-[28px] font-bold leading-snug text-[#212121] sm:text-[36px]">
            클리드는 단순히
            <br />
            기술을 배우는 곳이 아닙니다.
          </h2>
        </Reveal>

        {/* 스태거 카드 */}
        <div className="grid grid-cols-1 gap-3 pb-20 sm:grid-cols-2 lg:grid-cols-4 lg:pb-28">
          {cards.map((card) => (
            <Reveal
              key={card.title}
              delay={card.delay}
              as="article"
              className={card.offset ? "lg:mt-[115px]" : ""}
            >
              <Link href={card.href} className="group block">
                <div className="relative flex aspect-[300/420] flex-col overflow-hidden rounded-lg bg-black p-6 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                  <h3 className="relative z-10 mb-3 text-[22px] font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="relative z-10 whitespace-pre-line text-[16px] leading-relaxed text-[#dedede]">
                    {card.description}
                  </p>
                  <div className="absolute inset-x-0 bottom-5 flex h-[58%] items-center justify-center">
                    <Image
                      src={card.icon}
                      alt=""
                      width={320}
                      height={320}
                      className="h-auto max-h-full w-[72%] object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
