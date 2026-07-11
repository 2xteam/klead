import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Program, PermissionType } from "@/lib/db/models";

export const dynamic = "force-dynamic";

const LEVEL_LABEL: Record<string, string> = {
  basic: "베이직",
  master: "마스터",
  expert: "엑스퍼트",
};

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700"
          : "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500"
      }
    >
      {active ? "활성" : "비활성"}
    </span>
  );
}

export default async function AdminProgramsPage() {
  await connectDB();

  const [programs, permissionTypes] = await Promise.all([
    Program.find({})
      .select("code name isActive priceMonthly priceYearly sortOrder")
      .sort({ sortOrder: 1, code: 1 })
      .lean(),
    PermissionType.find({})
      .select("code name category level isActive sortOrder")
      .sort({ sortOrder: 1, code: 1 })
      .lean(),
  ]);

  const fmt = (n?: number | null) =>
    typeof n === "number" ? `${n.toLocaleString()}원` : "-";

  return (
    <div className="space-y-10">
      {/* 프로그램 목록 */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold">프로그램·권한</h1>
            <p className="mt-1 text-[13px] text-klead-gray-500">
              프로그램 {programs.length}개 · 권한유형 {permissionTypes.length}개
            </p>
          </div>
          <Link
            href="/admin/programs/new"
            className="rounded-md bg-klead-primary px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            새 프로그램
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">코드</th>
                <th className="px-4 py-3 font-semibold">이름</th>
                <th className="px-4 py-3 font-semibold">월요금</th>
                <th className="px-4 py-3 font-semibold">연요금</th>
                <th className="px-4 py-3 font-semibold">활성</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {programs.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-klead-gray-500"
                    colSpan={6}
                  >
                    등록된 프로그램이 없습니다.
                  </td>
                </tr>
              ) : (
                programs.map((p) => (
                  <tr
                    key={p._id.toString()}
                    className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]"
                  >
                    <td className="px-4 py-3 font-mono text-[13px]">
                      {p.code}
                    </td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-klead-gray-500">
                      {fmt(p.priceMonthly)}
                    </td>
                    <td className="px-4 py-3 text-klead-gray-500">
                      {fmt(p.priceYearly)}
                    </td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={p.isActive ?? true} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/programs/${p._id.toString()}`}
                        className="text-[13px] font-medium text-klead-primary hover:underline"
                      >
                        수정
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 권한유형 목록 */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[18px] font-bold">권한 유형</h2>
          <Link
            href="/admin/programs/permission-types/new"
            className="rounded-md bg-klead-primary px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            새 권한유형
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">코드</th>
                <th className="px-4 py-3 font-semibold">이름</th>
                <th className="px-4 py-3 font-semibold">카테고리</th>
                <th className="px-4 py-3 font-semibold">레벨</th>
                <th className="px-4 py-3 font-semibold">활성</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {permissionTypes.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-klead-gray-500"
                    colSpan={6}
                  >
                    등록된 권한유형이 없습니다.
                  </td>
                </tr>
              ) : (
                permissionTypes.map((t) => (
                  <tr
                    key={t._id.toString()}
                    className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]"
                  >
                    <td className="px-4 py-3 font-mono text-[13px]">
                      {t.code}
                    </td>
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-klead-gray-500">
                      {t.category}
                    </td>
                    <td className="px-4 py-3 text-klead-gray-500">
                      {t.level ? (LEVEL_LABEL[t.level] ?? t.level) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={t.isActive ?? true} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/programs/permission-types/${t._id.toString()}`}
                        className="text-[13px] font-medium text-klead-primary hover:underline"
                      >
                        수정
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
