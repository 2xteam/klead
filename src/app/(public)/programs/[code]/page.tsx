import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db/mongodb";
import {
  Program,
  ProgramPermission,
  PermissionType,
} from "@/lib/db/models";
import { PageHero } from "@/components/layout/page-hero";

export const dynamic = "force-dynamic";

function won(n?: number) {
  return typeof n === "number" && n > 0
    ? `₩${n.toLocaleString("ko-KR")}`
    : "문의";
}

async function getProgram(code: string) {
  await connectDB();
  const program = await Program.findOne({ code, isActive: true }).lean();
  if (!program) return null;
  const pp = await ProgramPermission.find({ programId: program._id })
    .select("permissionTypeId")
    .lean();
  const permTypes = await PermissionType.find({
    _id: { $in: pp.map((p) => p.permissionTypeId) },
  })
    .select("name category level")
    .sort({ sortOrder: 1 })
    .lean();
  return { program, permTypes };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const data = await getProgram(code);
  return {
    title: data ? `${data.program.name} 구독 | 클리드` : "구독 프로그램 | 클리드",
  };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const data = await getProgram(code);
  if (!data) notFound();
  const { program, permTypes } = data;

  return (
    <div>
      <PageHero
        variant="brand"
        eyebrow="MEMBERSHIP"
        title={program.name}
        description={program.description ?? "구독 프로그램"}
      />
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-24 lg:px-6 lg:py-28">
          <div className="rounded-2xl border border-black/10 p-8 lg:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-6">
              <div>
                <h2 className="text-[24px] font-bold">{program.name}</h2>
                {program.description && (
                  <p className="mt-2 text-[15px] text-klead-gray-500">
                    {program.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[30px] font-bold">
                  {won(program.priceMonthly)}
                  <span className="text-[14px] font-normal text-klead-gray-400">
                    {" "}
                    / 월
                  </span>
                </p>
                {program.priceYearly ? (
                  <p className="text-[13px] text-klead-gray-400">
                    연 결제 {won(program.priceYearly)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="py-6">
              <h3 className="mb-4 text-[16px] font-bold">포함 열람 권한</h3>
              {permTypes.length ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {permTypes.map((t) => (
                    <li
                      key={String(t._id)}
                      className="flex items-center gap-2 text-[14px] text-klead-gray-700"
                    >
                      <span className="text-klead-primary">✓</span>
                      {t.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-klead-gray-400">
                  포함 권한 정보가 없습니다.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-black/10 pt-6 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-full bg-klead-primary px-8 py-3.5 text-[15px] font-semibold text-white transition hover:opacity-90"
              >
                {won(program.priceMonthly)} / 월 구독 신청
              </button>
              <Link
                href="/programs"
                className="rounded-full border border-black/15 px-8 py-3.5 text-center text-[15px] font-semibold transition hover:bg-black/5"
              >
                다른 프로그램 보기
              </Link>
            </div>
            <p className="mt-3 text-center text-[12px] text-klead-gray-400">
              결제 연동은 준비 중입니다. 구독 신청 시 담당자가 안내드립니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
