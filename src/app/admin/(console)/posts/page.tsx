import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";

const CATEGORY_LABEL: Record<string, string> = {
  notice: "공지사항",
  resource: "자료실",
  event: "이벤트",
  guide: "가이드",
  community: "커뮤니티",
  about: "소개",
  expert_program: "전문가 과정",
};

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  await connectDB();
  const docs = await Content.find({ type: "content", deletedAt: null })
    .select("slug title contentCategory isPublic isPinned updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">게시글 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {docs.length}개 · 공지·자료·이벤트·가이드·커뮤니티
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-klead-primary px-4 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          새 게시글
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold">분류</th>
              <th className="px-4 py-3 font-semibold">공개</th>
              <th className="px-4 py-3 font-semibold">고정</th>
              <th className="px-4 py-3 font-semibold">수정일</th>
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
                  <span className="ml-2 text-[12px] text-klead-gray-400">
                    /{d.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {d.contentCategory
                    ? (CATEGORY_LABEL[d.contentCategory] ?? d.contentCategory)
                    : "-"}
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
                  {d.isPinned ? "고정" : "-"}
                </td>
                <td className="px-4 py-3 text-[12px] text-klead-gray-400">
                  {d.updatedAt
                    ? new Date(d.updatedAt).toISOString().slice(0, 10)
                    : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/posts/${String(d._id)}`}
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
