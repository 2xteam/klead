import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";

const CATEGORY_LABEL: Record<string, string> = {
  waxing: "왁싱",
  eyebrow: "눈썹",
  scalp: "두피관리",
  face_design: "페이스디자인",
  skin_care: "피부관리",
  body_care: "바디관리",
  theory: "이론",
  business: "경영",
};

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  await connectDB();
  const docs = await Content.find({ type: "lecture", deletedAt: null })
    .select("slug title lectureCategory isPublic priceDisplay updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">강의 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {docs.length}개 · klead.kr 실제 강의 및 시드 데이터
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold">분류</th>
              <th className="px-4 py-3 font-semibold">가격</th>
              <th className="px-4 py-3 font-semibold">공개</th>
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
                  <Link
                    href={`/admin/classes/${d.slug}`}
                    className="font-medium hover:text-klead-primary hover:underline"
                  >
                    {d.title}
                  </Link>
                  <span className="ml-2 text-[12px] text-klead-gray-400">
                    /{d.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {d.lectureCategory
                    ? (CATEGORY_LABEL[d.lectureCategory] ?? d.lectureCategory)
                    : "-"}
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {d.priceDisplay === "free"
                    ? "무료"
                    : d.priceDisplay === "amount"
                      ? "유료"
                      : "가격문의"}
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
                <td className="px-4 py-3 text-[12px] text-klead-gray-400">
                  {d.updatedAt
                    ? new Date(d.updatedAt).toISOString().slice(0, 10)
                    : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/classes/${d.slug}`}
                      className="text-[13px] font-medium text-klead-primary hover:underline"
                    >
                      수정
                    </Link>
                    <a
                      href={`/courses/${d.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-medium text-klead-gray-500 hover:underline"
                    >
                      보기
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
