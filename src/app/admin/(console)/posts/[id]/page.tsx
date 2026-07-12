import { notFound } from "next/navigation";
import Link from "next/link";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import {
  PostEditor,
  type PostFormData,
  type ContentCategory,
  type PublishStatus,
} from "@/components/admin/post-editor";

export const dynamic = "force-dynamic";

const EMPTY: PostFormData = {
  _id: null,
  title: "",
  slug: "",
  contentCategory: "notice",
  summary: "",
  body: "",
  thumbnail: "",
  isPinned: false,
  isPublic: false,
  publishStatus: "draft",
  sections: [],
};

const EDITABLE_CATEGORIES: ContentCategory[] = [
  "notice",
  "resource",
  "event",
  "guide",
  "community",
];

export default async function AdminPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/admin/posts"
            className="text-[13px] text-klead-gray-500 hover:underline"
          >
            ← 게시글 목록
          </Link>
          <h1 className="mt-2 text-[22px] font-bold">새 게시글</h1>
        </div>
        <PostEditor initial={EMPTY} />
      </div>
    );
  }

  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();
  const doc = await Content.findOne({
    _id: id,
    type: "content",
    deletedAt: null,
  }).lean();
  if (!doc) notFound();

  const category = doc.contentCategory ?? "notice";
  const initial: PostFormData = {
    _id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    contentCategory: (EDITABLE_CATEGORIES.includes(
      category as ContentCategory,
    )
      ? category
      : "notice") as ContentCategory,
    summary: doc.summary ?? "",
    body: doc.body ?? "",
    thumbnail: doc.thumbnail ?? "",
    isPinned: doc.isPinned ?? false,
    isPublic: doc.isPublic ?? false,
    publishStatus: (doc.publish?.status ?? "draft") as PublishStatus,
    sections: JSON.parse(JSON.stringify(doc.sections ?? [])),
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          href="/admin/posts"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← 게시글 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">게시글 수정</h1>
        <p className="mt-1 text-[13px] text-klead-gray-400">/{doc.slug}</p>
      </div>
      <PostEditor initial={initial} />
    </div>
  );
}
