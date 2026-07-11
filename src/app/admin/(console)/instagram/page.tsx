import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { InstagramPost } from "@/lib/db/models";

export const dynamic = "force-dynamic";

export default async function AdminInstagramPage() {
  await connectDB();
  const docs = await InstagramPost.find({})
    .select("image caption isActive sortOrder")
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">인스타그램 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {docs.length}개
          </p>
        </div>
        <Link
          href="/admin/instagram/new"
          className="rounded-md bg-klead-primary px-4 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          새 게시물
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">썸네일</th>
              <th className="px-4 py-3 font-semibold">캡션</th>
              <th className="px-4 py-3 font-semibold">활성</th>
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
                  {d.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.image}
                      alt=""
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-black/5" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="line-clamp-1 text-klead-gray-500">
                    {d.caption || "-"}
                  </span>
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
                <td className="px-4 py-3 text-klead-gray-500">{d.sortOrder}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/instagram/${String(d._id)}`}
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
