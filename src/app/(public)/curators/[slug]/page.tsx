import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import type { IPageSection } from "@/lib/db/models/content";
import { SectionRenderer } from "@/components/content/section-renderer";

export const dynamic = "force-dynamic";

async function getCurator(slug: string) {
  await connectDB();
  return Content.findOne({
    slug: `curator-${slug}`,
    type: "content",
    contentCategory: "curator",
    isPublic: true,
    "publish.status": "published",
    deletedAt: null,
  }).lean();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getCurator(slug);
  if (!doc) return { title: "테크 큐레이터 | 클리드" };
  return {
    title: doc.seo?.title ?? `${doc.title} | 클리드`,
    description: doc.seo?.description ?? doc.summary,
    openGraph: {
      title: doc.seo?.title ?? doc.title,
      description: doc.seo?.description ?? doc.summary,
      images: doc.thumbnail ? [doc.thumbnail] : undefined,
    },
  };
}

export default async function CuratorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getCurator(slug);
  if (!doc) notFound();

  const sections = JSON.parse(
    JSON.stringify(doc.sections ?? []),
  ) as IPageSection[];

  return (
    <>
      <SectionRenderer sections={sections} />

      <div className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12 lg:px-6">
          <Link
            href="/curators"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-[14px] font-semibold text-klead-gray-900 transition hover:bg-black/5"
          >
            <span aria-hidden>←</span> 목록으로
          </Link>
        </div>
      </div>
    </>
  );
}
