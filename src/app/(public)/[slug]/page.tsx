import { notFound, redirect } from "next/navigation";
import connectDB from "@/lib/db/mongodb";
import { Content, Program } from "@/lib/db/models";

export const dynamic = "force-dynamic";

/**
 * 루트 슬러그 리졸버: /{slug} 로 들어오면 큐레이터·강의·구독권을 찾아
 * 실제 페이지로 연결한다. (AI 상담사가 제공하는 "/slug" 형태 링크 대응)
 * 정적 경로(/about, /courses, /curators ...)가 우선 매칭되므로 충돌하지 않는다.
 */
export default async function SlugResolverPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectDB();

  const curator = await Content.findOne({
    slug,
    contentCategory: "curator",
    "publish.status": "published",
    deletedAt: null,
  })
    .select("_id")
    .lean();
  if (curator) redirect(`/curators/${slug}`);

  const lecture = await Content.findOne({
    slug,
    type: "lecture",
    "publish.status": "published",
    deletedAt: null,
  })
    .select("_id")
    .lean();
  if (lecture) redirect(`/courses/${slug}`);

  const program = await Program.findOne({ code: slug, isActive: true })
    .select("_id")
    .lean();
  if (program) redirect(`/programs/${slug}`);

  notFound();
}
