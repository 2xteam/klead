import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Popup } from "@/lib/db/models";

export const dynamic = "force-dynamic";

function fmt(d: Date | string | null | undefined): string {
  if (!d) return "-";
  return new Date(d).toISOString().slice(0, 16).replace("T", " ");
}

export default async function AdminPopupsPage() {
  await connectDB();
  const docs = await Popup.find({})
    .select("title isActive display.startDt display.endDt sortOrder")
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">팝업 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {docs.length}개
          </p>
        </div>
        <Link
          href="/admin/popups/new"
          className="rounded-md bg-klead-primary px-4 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          새 팝업
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold">활성</th>
              <th className="px-4 py-3 font-semibold">노출기간</th>
              <th className="px-4 py-3 font-semibold">순서</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr
                key={String(d._id)}
                className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]"
              >
                <td className="px-4 py-3">
                  <span className="font-medium">{d.title}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      d.isActive
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500"
                    }
                  >
                    {d.isActive ? "활성" : "비활성"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-klead-gray-500">
                  {fmt(d.display?.startDt)} ~ {fmt(d.display?.endDt)}
                </td>
                <td className="px-4 py-3 text-klead-gray-500">{d.sortOrder}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/popups/${String(d._id)}`}
                    className="text-[13px] font-medium text-klead-primary hover:underline"
                  >
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
