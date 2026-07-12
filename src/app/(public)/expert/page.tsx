import type { Metadata } from "next";
import connectDB from "@/lib/db/mongodb";
import { Content, Banner } from "@/lib/db/models";
import { ExpertProgramView } from "@/components/expert/expert-program-view";
import { PlaceholderPage } from "@/components/common/placeholder-page";
import { hydrateBannerSections } from "@/lib/content/hydrate-sections";
import type { IPageSection } from "@/lib/db/models/content";

export async function generateMetadata(): Promise<Metadata> {
  await connectDB();
  const doc = await Content.findOne({
    slug: "expert-program",
    "publish.status": "published",
  }).lean();

  return {
    title: doc?.seo?.title ?? "전문가 과정 | 클리드",
    description:
      doc?.seo?.description ??
      "실전형 교육자 양성 프로그램 — 4단계 성장 구조",
    openGraph: {
      title: doc?.seo?.title ?? "전문가 과정 | 클리드",
      description: doc?.seo?.description,
      images: doc?.seo?.ogImage ? [doc.seo.ogImage] : undefined,
    },
  };
}

export default async function ExpertPage() {
  await connectDB();
  const doc = await Content.findOne({
    slug: "expert-program",
    contentCategory: "expert_program",
    "publish.status": "published",
    deletedAt: null,
  }).lean();

  if (!doc?.sections?.length) {
    return (
      <PlaceholderPage
        title="전문가 과정"
        description="콘텐츠를 불러오는 중입니다. npm run seed:expert 를 실행해 주세요."
      />
    );
  }

  // "파트너들" 자리는 배너 관리에서 만든 파트너사 배너로 렌더
  const partnerBanner = await Banner.findOne({ name: "파트너사 배너" })
    .select("_id")
    .lean();

  let sections = doc.sections as IPageSection[];
  if (partnerBanner) {
    sections = sections.map((s) =>
      s.key === "partners"
        ? {
            key: "partners",
            type: "banner" as const,
            bannerId: String(partnerBanner._id),
            sortOrder: s.sortOrder,
          }
        : s,
    );
    sections = await hydrateBannerSections(sections);
  }

  return <ExpertProgramView title={doc.title} sections={sections} />;
}
