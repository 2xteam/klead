import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { QnA, User } from "@/lib/db/models";

const STATUS_LABEL: Record<string, string> = {
  pending: "대기",
  answered: "답변완료",
  closed: "종료",
};

const STATUS_BADGE: Record<string, string> = {
  pending:
    "rounded-full bg-yellow-100 px-2 py-0.5 text-[12px] font-medium text-yellow-700",
  answered:
    "rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700",
  closed:
    "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500",
};

export const dynamic = "force-dynamic";

export default async function AdminQnAPage() {
  await connectDB();
  const docs = await QnA.find({})
    .select("title status isPrivate userId createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const userIds = [...new Set(docs.map((d) => d.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } })
    .select("name")
    .lean();
  const userNameMap = new Map(users.map((u) => [u._id.toString(), u.name]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">Q&amp;A 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {docs.length}개 · 회원 질문 및 답변
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold">상태</th>
              <th className="px-4 py-3 font-semibold">공개</th>
              <th className="px-4 py-3 font-semibold">작성자</th>
              <th className="px-4 py-3 font-semibold">작성일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[13px] text-klead-gray-400"
                >
                  등록된 질문이 없습니다.
                </td>
              </tr>
            ) : (
              docs.map((d) => (
                <tr
                  key={d._id.toString()}
                  className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium">{d.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={STATUS_BADGE[d.status] ?? STATUS_BADGE.pending}
                    >
                      {STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        d.isPrivate
                          ? "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500"
                          : "rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700"
                      }
                    >
                      {d.isPrivate ? "비공개" : "공개"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-klead-gray-500">
                    {userNameMap.get(d.userId.toString()) ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-klead-gray-400">
                    {d.createdAt
                      ? new Date(d.createdAt).toISOString().slice(0, 10)
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/qna/${d._id.toString()}`}
                      className="text-[13px] font-medium text-klead-primary hover:underline"
                    >
                      답변
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
