import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { User } from "@/lib/db/models";

const PROVIDER_LABEL: Record<string, string> = {
  kakao: "카카오",
  test: "테스트",
};

const ROLE_LABEL: Record<string, string> = {
  member: "회원",
  admin: "관리자",
};

const STATUS_LABEL: Record<string, string> = {
  active: "활성",
  suspended: "정지",
  withdrawn: "탈퇴",
};

const STATUS_BADGE: Record<string, string> = {
  active: "rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700",
  suspended:
    "rounded-full bg-amber-100 px-2 py-0.5 text-[12px] font-medium text-amber-700",
  withdrawn:
    "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500",
};

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  await connectDB();
  const docs = await User.find({})
    .select("name email authProvider role status createdAt lastLoginAt")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">회원 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {docs.length}명
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">이름</th>
              <th className="px-4 py-3 font-semibold">이메일</th>
              <th className="px-4 py-3 font-semibold">가입경로</th>
              <th className="px-4 py-3 font-semibold">권한</th>
              <th className="px-4 py-3 font-semibold">상태</th>
              <th className="px-4 py-3 font-semibold">가입일</th>
              <th className="px-4 py-3 font-semibold">최근 로그인</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-[13px] text-klead-gray-400"
                >
                  등록된 회원이 없습니다.
                </td>
              </tr>
            ) : (
              docs.map((d) => (
                <tr
                  key={String(d._id)}
                  className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]"
                >
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-klead-gray-500">
                    {d.email ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-klead-gray-500">
                    {PROVIDER_LABEL[d.authProvider] ?? d.authProvider}
                  </td>
                  <td className="px-4 py-3 text-klead-gray-500">
                    {ROLE_LABEL[d.role] ?? d.role}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        STATUS_BADGE[d.status] ?? STATUS_BADGE.withdrawn
                      }
                    >
                      {STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-klead-gray-400">
                    {d.createdAt
                      ? new Date(d.createdAt).toISOString().slice(0, 10)
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-klead-gray-400">
                    {d.lastLoginAt
                      ? new Date(d.lastLoginAt).toISOString().slice(0, 10)
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/members/${String(d._id)}`}
                      className="text-[13px] font-medium text-klead-primary hover:underline"
                    >
                      관리
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
