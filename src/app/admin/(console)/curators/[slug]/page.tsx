import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import type { IPageSection } from "@/lib/db/models/content";
import {
  CuratorEditor,
  type CuratorFormData,
} from "@/components/admin/curator-editor";

export const dynamic = "force-dynamic";

const EMPTY: CuratorFormData = {
  slug: "",
  title: "",
  summary: "",
  thumbnail: "",
  isPublic: false,
  sections: [],
};

export default async function AdminCuratorEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const isNew = slug === "new";

  let initial: CuratorFormData = EMPTY;
  let contentId: string | null = null;

  if (!isNew) {
    await connectDB();
    const doc = await Content.findOne({
      slug,
      type: "content",
      contentCategory: "curator",
      deletedAt: null,
    }).lean();
    if (!doc) notFound();
    contentId = String(doc._id);

    initial = {
      slug: doc.slug,
      title: doc.title,
      summary: doc.summary ?? "",
      thumbnail: doc.thumbnail ?? "",
      isPublic: doc.isPublic ?? false,
      sections: JSON.parse(
        JSON.stringify(doc.sections ?? []),
      ) as IPageSection[],
    };
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/curators"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← 큐레이터 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">
          {isNew ? "새 큐레이터" : "큐레이터 수정"}
        </h1>
        {!isNew && (
          <p className="mt-1 text-[13px] text-klead-gray-400">/{initial.slug}</p>
        )}
      </div>
      <CuratorEditor
        slug={isNew ? null : slug}
        contentId={contentId}
        initial={initial}
      />
    </div>
  );
}
