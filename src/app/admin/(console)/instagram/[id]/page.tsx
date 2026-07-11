import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { InstagramPost } from "@/lib/db/models";
import {
  InstagramEditor,
  type InstagramFormData,
} from "@/components/admin/instagram-editor";

export const dynamic = "force-dynamic";

const EMPTY: InstagramFormData = {
  image: "",
  link: "",
  caption: "",
  sortOrder: 0,
  isActive: true,
};

export default async function AdminInstagramEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let initial: InstagramFormData = EMPTY;

  if (!isNew) {
    await connectDB();
    const doc = await InstagramPost.findById(id).lean();
    if (!doc) notFound();
    initial = {
      image: doc.image ?? "",
      link: doc.link ?? "",
      caption: doc.caption ?? "",
      sortOrder: doc.sortOrder ?? 0,
      isActive: doc.isActive ?? true,
    };
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/instagram"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← 인스타그램 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">
          {isNew ? "새 게시물" : "게시물 수정"}
        </h1>
      </div>
      <InstagramEditor id={isNew ? null : id} initial={initial} />
    </div>
  );
}
