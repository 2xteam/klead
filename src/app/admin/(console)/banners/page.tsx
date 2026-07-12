import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Banner } from "@/lib/db/models";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  await connectDB();
  const docs = await Banner.find({}).sort({ updatedAt: -1 }).lean();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">배너 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {docs.length}개 · 콘텐츠 구역에서 &quot;배너&quot;로 삽입해 재사용
          </p>
        </div>
        <Link
          href="/admin/banners/new"
          className="rounded-md bg-klead-primary px-4 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          새 배너
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">배경</th>
              <th className="px-4 py-3 font-semibold">이름</th>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold">로고</th>
              <th className="px-4 py-3 font-semibold">활성</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-klead-gray-400"
                >
                  등록된 배너가 없습니다.
                </td>
              </tr>
            )}
            {docs.map((d) => (
              <tr
                key={String(d._id)}
                className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]"
              >
                <td className="px-4 py-3">
                  {d.backgroundImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.backgroundImage}
                      alt=""
                      className="h-10 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-16 rounded bg-black/5" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/banners/${String(d._id)}`}
                    className="font-medium hover:text-klead-primary hover:underline"
                  >
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {d.title || "-"}
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {d.logos?.length ?? 0}개
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
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/banners/${String(d._id)}`}
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
