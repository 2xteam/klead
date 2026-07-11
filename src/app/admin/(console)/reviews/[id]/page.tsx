import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Review, Content, User } from "@/lib/db/models";
import {
  ReviewEditor,
  type ReviewFormData,
} from "@/components/admin/review-editor";

export const dynamic = "force-dynamic";

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const doc = await Review.findById(id).lean();
  if (!doc) notFound();

  const [content, author] = await Promise.all([
    Content.findById(doc.contentId).select("title").lean(),
    User.findById(doc.userId).select("name").lean(),
  ]);

  const initial: ReviewFormData = {
    id: String(doc._id),
    rating: doc.rating,
    title: doc.title ?? "",
    body: doc.body,
    isVisible: doc.isVisible,
    isFeatured: doc.isFeatured,
  };

  const createdAt = doc.createdAt
    ? new Date(doc.createdAt).toISOString().slice(0, 10)
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/reviews"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← 리뷰 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">리뷰 수정</h1>
        <p className="mt-1 text-[13px] text-klead-gray-400">
          작성자 {author?.name ?? "-"}
          {createdAt ? ` · ${createdAt}` : ""}
        </p>
      </div>

      <section className="mb-6 space-y-3 rounded-lg border border-black/10 bg-white p-6">
        <div>
          <span className="mb-1 block text-[13px] font-semibold text-klead-gray-500">
            강의명
          </span>
          <p className="text-[16px] font-semibold">{content?.title ?? "-"}</p>
        </div>
        <div>
          <span className="mb-1 block text-[13px] font-semibold text-klead-gray-500">
            작성자
          </span>
          <p className="text-[14px] text-klead-gray-700">
            {author?.name ?? "-"}
          </p>
        </div>
      </section>

      <ReviewEditor initial={initial} />
    </div>
  );
}
