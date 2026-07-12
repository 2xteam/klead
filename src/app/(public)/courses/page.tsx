import { Suspense } from "react";
import { cookies } from "next/headers";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import { PageHero } from "@/components/layout/page-hero";
import {
  getAccessiblePermissionTypeIds,
  parseMemberCookie,
} from "@/lib/content/access";
import { getUserGrantedContentIds } from "@/lib/content/lecture-access";
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
    .select(
      "slug title summary thumbnail lectureCategory priceDisplay permissionTypeId isPinned",
    )
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();

  // 로그인 사용자의 접근 가능 권한 집합
  const store = await cookies();
  const member = parseMemberCookie(store.get("klead_member")?.value);
  const accessible = member
    ? await getAccessiblePermissionTypeIds(member.id)
    : new Set<string>();
  const granted = member
    ? await getUserGrantedContentIds(member.id)
    : new Set<string>();

  const courses: CourseCard[] = docs.map((d) => {
    const permId = d.permissionTypeId ? String(d.permissionTypeId) : null;
    // 권한이 지정된 강의만 잠금 대상. 등급 권한 또는 개별 열람권 보유 시 열람 가능.
    const locked = permId
      ? !accessible.has(permId) && !granted.has(String(d._id))
      : false;
    return {
      slug: d.slug,
      title: d.title,
      summary: d.summary ?? "",
      thumbnail: d.thumbnail ?? "",
      lectureCategory: d.lectureCategory ?? undefined,
      priceDisplay: d.priceDisplay ?? "inquiry",
      locked,
    };
  });

  return (
    <div>
      <PageHero
        variant="brand"
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
