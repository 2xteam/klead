import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";

export const dynamic = "force-dynamic";

export default async function AdminCuratorsPage() {
  await connectDB();
  const docs = await Content.find({
    type: "content",
    contentCategory: "curator",
    deletedAt: null,
  })
    .select("slug title summary isPublic sections updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">테크 큐레이터 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {docs.length}명
          </p>
        </div>
        <Link
          href="/admin/curators/new"
          className="rounded-md bg-klead-primary px-5 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          새 큐레이터
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">이름</th>
              <th className="px-4 py-3 font-semibold">직함</th>
              <th className="px-4 py-3 font-semibold">공개</th>
              <th className="px-4 py-3 font-semibold">섹션 수</th>
              <th className="px-4 py-3 font-semibold">수정일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr
                key={d.slug}
                className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]"
              >
                <td className="px-4 py-3">
                  <span className="font-medium">{d.title}</span>
                  <span className="ml-2 text-[12px] text-klead-gray-400">
                    /{d.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {d.summary ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      d.isPublic
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500"
                    }
                  >
                    {d.isPublic ? "공개" : "비공개"}
                  </span>
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {d.sections?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-[12px] text-klead-gray-400">
                  {d.updatedAt
                    ? new Date(d.updatedAt).toISOString().slice(0, 10)
                    : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/curators/${d.slug}`}
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
