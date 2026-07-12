import Link from "next/link";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Review } from "@/lib/db/models";
import type { IReview } from "@/lib/db/models/review";

export const dynamic = "force-dynamic";

type PopulatedReview = Omit<IReview, "contentId" | "userId"> & {
  contentId: { _id: Types.ObjectId; title: string; slug: string } | null;
  userId: { _id: Types.ObjectId; name: string } | null;
};

function stars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

export default async function AdminReviewsPage() {
  await connectDB();
  const docs = (await Review.find({})
    .populate("contentId", "title slug")
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .lean()) as unknown as PopulatedReview[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">리뷰 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {docs.length}개 · 구매평 노출 및 추천 관리
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">강의명</th>
              <th className="px-4 py-3 font-semibold">작성자</th>
              <th className="px-4 py-3 font-semibold">평점</th>
              <th className="px-4 py-3 font-semibold">노출</th>
              <th className="px-4 py-3 font-semibold">추천</th>
              <th className="px-4 py-3 font-semibold">작성일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-[13px] text-klead-gray-400"
                >
                  등록된 리뷰가 없습니다.
                </td>
              </tr>
            ) : (
              docs.map((d) => (
                <tr
                  key={String(d._id)}
                  className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/reviews/${String(d._id)}`}
                      className="font-medium hover:text-klead-primary hover:underline"
                    >
                      {d.contentId?.title ?? "-"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-klead-gray-500">
                    {d.userId?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-yellow-500">
                    {stars(d.rating)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        d.isVisible
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700"
                          : "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500"
                      }
                    >
                      {d.isVisible ? "노출" : "숨김"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        d.isFeatured
                          ? "rounded-full bg-yellow-100 px-2 py-0.5 text-[12px] font-medium text-yellow-700"
                          : "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500"
                      }
                    >
                      {d.isFeatured ? "추천" : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-klead-gray-400">
                    {d.createdAt
                      ? new Date(d.createdAt).toISOString().slice(0, 10)
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/reviews/${String(d._id)}`}
                        className="text-[13px] font-medium text-klead-primary hover:underline"
                      >
                        수정
                      </Link>
                      {d.contentId?.slug && (
                        <a
                          href={`/courses/${d.contentId.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium text-klead-gray-500 hover:underline"
                        >
                          보기
                        </a>
                      )}
                    </div>
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
