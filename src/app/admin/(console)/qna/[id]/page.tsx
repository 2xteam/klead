import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { QnA, User } from "@/lib/db/models";
import {
  QnAAnswerEditor,
  type QnAAnswerFormData,
} from "@/components/admin/qna-answer-editor";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "대기",
  answered: "답변완료",
  closed: "종료",
};

export default async function AdminQnADetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const doc = await QnA.findById(id).lean();
  if (!doc) notFound();

  const author = await User.findById(doc.userId).select("name").lean();

  const initial: QnAAnswerFormData = {
    id: doc._id.toString(),
    status: doc.status,
    answerBody: doc.answer?.body ?? "",
  };

  const answeredAt = doc.answer?.answeredAt
    ? new Date(doc.answer.answeredAt).toISOString().slice(0, 10)
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/qna"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← Q&amp;A 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">질문 답변</h1>
        <p className="mt-1 text-[13px] text-klead-gray-400">
          작성자 {author?.name ?? "-"} ·{" "}
          {STATUS_LABEL[doc.status] ?? doc.status}
          {doc.isPrivate ? " · 비공개" : ""}
        </p>
      </div>

      <section className="mb-6 space-y-3 rounded-lg border border-black/10 bg-white p-6">
        <div>
          <span className="mb-1 block text-[13px] font-semibold text-klead-gray-500">
            제목
          </span>
          <p className="text-[16px] font-semibold">{doc.title}</p>
        </div>
        <div>
          <span className="mb-1 block text-[13px] font-semibold text-klead-gray-500">
            내용
          </span>
          <p className="whitespace-pre-wrap text-[14px] text-klead-gray-700">
            {doc.body}
          </p>
        </div>
        {answeredAt && (
          <p className="text-[12px] text-klead-gray-400">
            최종 답변일 {answeredAt}
          </p>
        )}
      </section>

      <QnAAnswerEditor initial={initial} />
    </div>
  );
}
