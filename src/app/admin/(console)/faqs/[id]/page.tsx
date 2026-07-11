import { notFound } from "next/navigation";
import Link from "next/link";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Faq } from "@/lib/db/models";
import { FaqEditor, type FaqFormData } from "@/components/admin/faq-editor";

export const dynamic = "force-dynamic";

export default async function AdminFaqEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    const initial: FaqFormData = {
      _id: null,
      category: "",
      question: "",
      answer: "",
      sortOrder: 0,
      isPublished: true,
    };
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/admin/faqs"
            className="text-[13px] text-klead-gray-500 hover:underline"
          >
            ← FAQ 목록
          </Link>
          <h1 className="mt-2 text-[22px] font-bold">새 FAQ</h1>
        </div>
        <FaqEditor initial={initial} />
      </div>
    );
  }

  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const doc = await Faq.findById(id).lean();
  if (!doc) notFound();

  const initial: FaqFormData = {
    _id: String(doc._id),
    category: doc.category ?? "",
    question: doc.question,
    answer: doc.answer,
    sortOrder: doc.sortOrder ?? 0,
    isPublished: doc.isPublished ?? false,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/faqs"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← FAQ 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">FAQ 수정</h1>
      </div>
      <FaqEditor initial={initial} />
    </div>
  );
}
