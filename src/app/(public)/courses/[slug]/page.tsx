import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import connectDB from "@/lib/db/mongodb";
import { Content, Review, QnA, User } from "@/lib/db/models";
import type { IPageSection } from "@/lib/db/models/content";
import { SectionRenderer } from "@/components/content/section-renderer";
import {
  ClassProductView,
  type ProductReview,
  type ProductQna,
} from "@/components/courses/class-product-view";

const CATEGORY_LABEL: Record<string, string> = {
  waxing: "왁싱",
  eyebrow: "눈썹",
  scalp: "두피관리",
  face_design: "페이스디자인",
  skin_care: "피부관리",
  body_care: "바디관리",
  theory: "이론",
  business: "경영",
};

// 카테고리 슬러그로 들어오면 필터 목록으로 (구 링크 호환)
const CATEGORY_SLUGS: Record<string, string> = {
  waxing: "waxing",
  scalp: "scalp",
  "skin-care": "skin_care",
  skin_care: "skin_care",
  "body-care": "body_care",
  body_care: "body_care",
  "face-design": "face_design",
  face_design: "face_design",
  theory: "theory",
  business: "business",
  eyebrow: "eyebrow",
};

async function getCourse(slug: string) {
  await connectDB();
  return Content.findOne({
    slug,
    type: "lecture",
    isPublic: true,
    "publish.status": "published",
    deletedAt: null,
  }).lean();
}

function fmtDate(d?: Date) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getCourse(slug);
  if (!doc) return { title: "강의 | 클리드" };
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

export default async function ClassProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (CATEGORY_SLUGS[slug]) {
    redirect(`/courses?category=${CATEGORY_SLUGS[slug]}`);
  }
  const doc = await getCourse(slug);
  if (!doc) notFound();

  // 리뷰 + Q&A (상품별)
  const [reviewDocs, qnaDocs] = await Promise.all([
    Review.find({ contentId: doc._id, isVisible: true })
      .sort({ isFeatured: -1, createdAt: -1 })
      .populate("userId", "name")
      .lean(),
    QnA.find({ contentId: doc._id })
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .lean(),
  ]);

  const reviews: ProductReview[] = reviewDocs.map((r) => ({
    id: String(r._id),
    author:
      (r.userId as unknown as { name?: string } | null)?.name ?? "회원",
    rating: r.rating,
    title: r.title,
    body: r.body,
    images: r.images ?? [],
    createdAt: fmtDate(r.createdAt),
  }));

  const qna: ProductQna[] = qnaDocs.map((q) => ({
    id: String(q._id),
    author:
      (q.userId as unknown as { name?: string } | null)?.name ?? "회원",
    title: q.title,
    body: q.body,
    status: q.status,
    answer: q.answer?.body,
    isPrivate: q.isPrivate,
    createdAt: fmtDate(q.createdAt),
  }));

  const gallery =
    doc.gallery && doc.gallery.length > 0
      ? doc.gallery
      : doc.thumbnail
        ? [doc.thumbnail]
        : [];

  const priceLabel =
    doc.priceDisplay === "free"
      ? "무료"
      : doc.priceDisplay === "amount" && doc.priceAmount
        ? `${doc.priceAmount.toLocaleString()}원`
        : "가격문의";

  const sections = JSON.parse(
    JSON.stringify(doc.sections ?? []),
  ) as IPageSection[];

  return (
    <ClassProductView
      product={{
        slug: doc.slug,
        title: doc.title,
        summary: doc.summary,
        categoryLabel: doc.lectureCategory
          ? (CATEGORY_LABEL[doc.lectureCategory] ?? doc.lectureCategory)
          : undefined,
        priceLabel,
        gallery,
        likeCount: doc.likeCount ?? 0,
      }}
      detail={<SectionRenderer sections={sections} />}
      reviews={reviews}
      qna={qna}
    />
  );
}
