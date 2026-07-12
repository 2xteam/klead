import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Program } from "@/lib/db/models";
import { PageHero } from "@/components/layout/page-hero";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "구독 프로그램 | 클리드",
  description: "구독권으로 클리드의 강의를 열람하세요.",
};

function won(n?: number) {
  return typeof n === "number" && n > 0
    ? `₩${n.toLocaleString("ko-KR")}`
    : "문의";
}

export default async function ProgramsPage() {
  await connectDB();
  const docs = await Program.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .lean();

  return (
    <div>
      <PageHero
        variant="brand"
        eyebrow="MEMBERSHIP"
        title="구독 프로그램"
        description="구독권 하나로 등급별 강의를 자유롭게 열람하세요."
      />
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-24 lg:px-6 lg:py-28">
          <div className="grid gap-6 md:grid-cols-3">
            {docs.map((p, i) => (
              <div
                key={String(p._id)}
                className={
                  "flex flex-col rounded-2xl border p-8 " +
                  (i === 1
                    ? "border-klead-primary shadow-lg"
                    : "border-black/10")
                }
              >
                {i === 1 && (
                  <span className="mb-3 inline-block w-fit rounded-full bg-klead-primary px-3 py-1 text-[12px] font-semibold text-white">
                    추천
                  </span>
                )}
                <h2 className="text-[22px] font-bold">{p.name}</h2>
                {p.description && (
                  <p className="mt-2 text-[14px] leading-relaxed text-klead-gray-500">
                    {p.description}
                  </p>
                )}
                <p className="mt-6 text-[28px] font-bold">
                  {won(p.priceMonthly)}
                  <span className="text-[14px] font-normal text-klead-gray-400">
                    {" "}
                    / 월
                  </span>
                </p>
                <Link
                  href={`/programs/${p.code}`}
                  className={
                    "mt-8 rounded-full px-6 py-3 text-center text-[15px] font-semibold transition " +
                    (i === 1
                      ? "bg-klead-primary text-white hover:opacity-90"
                      : "border border-black/15 hover:bg-black/5")
                  }
                >
                  자세히 보기
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
