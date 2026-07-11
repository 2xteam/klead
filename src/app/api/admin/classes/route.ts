import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";

/** 강의(lecture) 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await Content.find({ type: "lecture", deletedAt: null })
    .select("slug title lectureCategory isPublic priceDisplay updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({
    items: docs.map((d) => ({
      slug: d.slug,
      title: d.title,
      lectureCategory: d.lectureCategory ?? null,
      isPublic: d.isPublic ?? false,
      priceDisplay: d.priceDisplay ?? "inquiry",
      updatedAt: d.updatedAt,
    })),
  });
}
