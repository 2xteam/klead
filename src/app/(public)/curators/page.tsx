import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import { PageHero } from "@/components/layout/page-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "테크 큐레이터 | 클리드",
  description: "클리드와 함께하는 전문 강사진을 소개합니다.",
};

async function getCurators() {
  await connectDB();
  return Content.find({
    type: "content",
    contentCategory: "curator",
    isPublic: true,
    "publish.status": "published",
    deletedAt: null,
  })
    .select("slug title summary thumbnail createdAt")
    .lean();
}

function initials(name: string) {
  return name.trim().slice(0, 2);
}

export default async function CuratorsPage() {
  const docs = await getCurators();

  const ORDER = [
    "kim-boryeong",
    "kim-yujeong",
    "shin-semi",
    "moon-seolhui",
    "lee-hayan",
    "jo-euna",
    "chae-hansol",
  ];
  const curators = [...docs].sort((a, b) => {
    const ai = ORDER.indexOf(a.slug);
    const bi = ORDER.indexOf(b.slug);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });

  return (
    <>
      <PageHero
        variant="brand"
        eyebrow="TECH CURATOR"
        title="테크 큐레이터"
        description="클리드와 함께하는 전문 강사진을 소개합니다."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-16 lg:px-6 lg:py-20">
          {curators.length ? (
            <ul className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {curators.map((c) => {
                const href = `/curators/${c.slug}`;
                return (
                  <li key={c.slug}>
                    <Link href={href} className="group block text-center">
                      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black/5">
                        {c.thumbnail ? (
                          <Image
                            src={c.thumbnail}
                            alt={c.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 400px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-black text-[40px] font-bold text-white/90">
                            {initials(c.title)}
                          </div>
                        )}
                      </div>
                      <h2 className="mt-5 text-[18px] font-bold text-klead-gray-900">
                        {c.title}
                      </h2>
                      {c.summary && (
                        <p className="mt-1 text-[14px] text-klead-gray-500">
                          {c.summary}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-20 text-center text-[15px] text-klead-gray-500">
              등록된 테크 큐레이터가 없습니다.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
