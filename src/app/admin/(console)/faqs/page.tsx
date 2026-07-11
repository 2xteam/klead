import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Faq } from "@/lib/db/models";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  await connectDB();
  const docs = await Faq.find({})
    .select("category question isPublished sortOrder updatedAt")
    .sort({ sortOrder: 1, updatedAt: -1 })
    .lean();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">FAQ 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {docs.length}개
          </p>
        </div>
        <Link
          href="/admin/faqs/new"
          className="rounded-md bg-klead-primary px-4 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          새 FAQ
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">질문</th>
              <th className="px-4 py-3 font-semibold">분류</th>
              <th className="px-4 py-3 font-semibold">게시</th>
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
                  <span className="font-medium">{d.question}</span>
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {d.category ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      d.isPublished
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500"
                    }
                  >
                    {d.isPublished ? "게시" : "미게시"}
                  </span>
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {d.sortOrder ?? 0}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/faqs/${String(d._id)}`}
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
