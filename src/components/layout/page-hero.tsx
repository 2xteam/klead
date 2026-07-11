import Image from "next/image";
import { pageHero } from "@/config/site";

/**
 * 페이지 상단 헤로.
 * - variant "brand": 클리드/테크 큐레이터 — 건축 배너(hero-building) 풀블리드
 * - variant "simple": 전문가 과정/강의 종목 — 다크 미니멀 헤더
 */
export function PageHero({
  variant = "simple",
  eyebrow,
  title,
  description,
}: {
  variant?: "brand" | "simple";
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  if (variant === "brand") {
    return (
      <section className="relative h-[42vh] min-h-[320px] w-full overflow-hidden bg-black">
        <Image
          src={pageHero.building}
          alt=""
          fill
          priority
          className="object-cover object-center opacity-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1280px] px-4 pb-14 lg:px-6">
            {eyebrow && (
              <p className="mb-3 text-[13px] tracking-[0.25em] text-white/70">
                {eyebrow}
              </p>
            )}
            <h1 className="text-[30px] font-bold text-white sm:text-[42px]">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/80">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-black/5 bg-[#0e0e0e]">
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center lg:px-6 lg:py-24">
        {eyebrow && (
          <p className="mb-3 text-[13px] tracking-[0.25em] text-klead-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] font-bold text-white sm:text-[38px]">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
