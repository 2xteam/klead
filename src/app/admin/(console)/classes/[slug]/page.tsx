import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import type { IPageSection } from "@/lib/db/models/content";
import { ClassEditor, type ClassFormData } from "@/components/admin/class-editor";

export const dynamic = "force-dynamic";

export default async function AdminClassEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectDB();
  const doc = await Content.findOne({
    slug,
    type: "lecture",
    deletedAt: null,
  }).lean();
  if (!doc) notFound();

  const initial: ClassFormData = {
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary ?? "",
    thumbnail: doc.thumbnail ?? "",
    gallery: doc.gallery ?? [],
    priceDisplay: (doc.priceDisplay ?? "inquiry") as ClassFormData["priceDisplay"],
    priceAmount: doc.priceAmount ?? null,
    isPublic: doc.isPublic ?? false,
    sections: JSON.parse(
      JSON.stringify(doc.sections ?? []),
    ) as IPageSection[],
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/classes"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← 강의 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">강의 수정</h1>
        <p className="mt-1 text-[13px] text-klead-gray-400">/{doc.slug}</p>
      </div>
      <ClassEditor initial={initial} />
    </div>
  );
}
