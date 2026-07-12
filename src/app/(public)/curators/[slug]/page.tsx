import type { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import type { IPageSection } from "@/lib/db/models/content";
import { SectionRenderer } from "@/components/content/section-renderer";
import { CuratorTabs, type CuratorTab } from "@/components/content/curator-tabs";
import { hydrateBannerSections } from "@/lib/content/hydrate-sections";

export const dynamic = "force-dynamic";

// klead 탭 순서
const TAB_ORDER = [
  "kim-boryeong",
  "kim-yujeong",
  "shin-semi",
  "moon-seolhui",
  "lee-hayan",
  "jo-euna",
  "chae-hansol",
];

async function getCurator(slug: string) {
  await connectDB();
  return Content.findOne({
    slug,
    type: "content",
    contentCategory: "curator",
    isPublic: true,
    "publish.status": "published",
    deletedAt: null,
  }).lean();
}

async function getTabs(): Promise<CuratorTab[]> {
  await connectDB();
  const docs = await Content.find({
    type: "content",
    contentCategory: "curator",
    isPublic: true,
    "publish.status": "published",
    deletedAt: null,
  })
    .select("slug title")
    .lean();
  const tabs = docs.map((d) => ({ slug: d.slug, name: d.title }));
  return tabs.sort(
    (a, b) => TAB_ORDER.indexOf(a.slug) - TAB_ORDER.indexOf(b.slug),
  );
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
  const [doc, tabs] = await Promise.all([getCurator(slug), getTabs()]);
  if (!doc) notFound();

  const rawSections = JSON.parse(
    JSON.stringify(doc.sections ?? []),
  ) as IPageSection[];
  const sections = await hydrateBannerSections(rawSections);

  return (
    <>
      <CuratorTabs tabs={tabs} activeSlug={slug} />
      <SectionRenderer sections={sections} />
    </>
  );
}
