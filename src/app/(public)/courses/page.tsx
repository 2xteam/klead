import { Suspense } from "react";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import { PageHero } from "@/components/layout/page-hero";
import {
  CoursesFilter,
  type CourseCard,
} from "@/components/courses/courses-filter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "강의 종목 | 클리드",
  description: "클리드의 모든 과정은 현장 운영을 기준으로 설계됩니다.",
};

export default async function CoursesPage() {
  await connectDB();
  const docs = await Content.find({
    type: "lecture",
    isPublic: true,
    "publish.status": "published",
    deletedAt: null,
  })
    .select("slug title summary thumbnail lectureCategory priceDisplay isPinned")
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();

  const courses: CourseCard[] = docs.map((d) => ({
    slug: d.slug,
    title: d.title,
    summary: d.summary ?? "",
    thumbnail: d.thumbnail ?? "",
    lectureCategory: d.lectureCategory ?? undefined,
    priceDisplay: d.priceDisplay ?? "inquiry",
  }));

  return (
    <div>
      <PageHero
        variant="simple"
        eyebrow="BEAUTY CLASS"
        title="강의 종목"
        description="클리드의 모든 과정은 현장 운영을 기준으로 설계됩니다."
      />
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-16 lg:px-6 lg:py-20">
          <Suspense fallback={null}>
            <CoursesFilter courses={courses} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
