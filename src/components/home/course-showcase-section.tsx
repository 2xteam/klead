import Image from "next/image";
import Link from "next/link";
import { brandAssets } from "@/config/site";
import { Reveal } from "@/components/common/reveal";

export function CourseShowcaseSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 lg:px-6 lg:py-24">
      <Reveal>
        <p className="mb-2 text-[15px] text-klead-gray-500">
          클리트 강의 종목 카테고리
        </p>
      </Reveal>
      <Reveal delay={120}>
        <h2 className="mb-12 text-[22px] font-bold leading-snug sm:text-[28px]">
          얼리버드 할인 마감임박!
          <br />
          기회를 놓치지 마세요.
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {brandAssets.featuredCourses.map((course, index) => (
          <Reveal key={course.title} delay={index * 120} as="article">
            <Link
              href={course.href}
              className="group block transition-transform duration-500 ease-out hover:-translate-y-1.5"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f5f5f5] shadow-sm transition-shadow duration-500 group-hover:shadow-xl">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="mt-3">
                <h3 className="text-[16px] font-bold text-klead-gray-800">
                  {course.title}
                </h3>
                <p className="text-[16px] font-bold text-klead-gray-800">
                  {course.priceLabel}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={150} className="mt-14 text-center">
        <Link
          href="/courses"
          className="inline-block rounded-full bg-black px-10 py-3.5 text-[15px] font-medium text-white transition-transform hover:scale-105"
        >
          더보기 +
        </Link>
      </Reveal>
    </section>
  );
}
