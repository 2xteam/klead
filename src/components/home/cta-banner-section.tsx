import Link from "next/link";
import { brandAssets } from "@/config/site";
import { Reveal } from "@/components/common/reveal";

export function CtaBannerSection() {
  const { ctaBanner } = brandAssets;

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ctaBanner.image})` }}
      />
      <div className="absolute inset-0 bg-[rgba(4,4,4,0.62)]" />
      <div className="relative mx-auto max-w-[1280px] px-4 py-24 text-center lg:px-6 lg:py-28">
        <Reveal>
          <h2 className="text-[24px] font-bold leading-snug text-white sm:text-[32px]">
            {ctaBanner.title}
            <br />
            {ctaBanner.subtitle}
          </h2>
        </Reveal>

        <Reveal delay={200} className="mt-8">
          <Link
            href={ctaBanner.href}
            className="inline-block rounded-full bg-black px-8 py-3 text-[15px] font-medium text-white transition-transform hover:scale-105"
          >
            {ctaBanner.buttonLabel}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
