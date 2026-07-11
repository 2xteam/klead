import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Review } from "@/lib/db/models";
import type { IReview } from "@/lib/db/models/review";

type PopulatedReview = Omit<IReview, "contentId" | "userId"> & {
  contentId: { _id: Types.ObjectId; title: string } | null;
  userId: { _id: Types.ObjectId; name: string } | null;
};

/** 리뷰(구매평) 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = (await Review.find({})
    .populate("contentId", "title")
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .lean()) as unknown as PopulatedReview[];

  return NextResponse.json({
    items: docs.map((d) => ({
      _id: String(d._id),
      contentTitle: d.contentId?.title ?? null,
      authorName: d.userId?.name ?? null,
      rating: d.rating,
      title: d.title ?? "",
      isVisible: d.isVisible,
      isFeatured: d.isFeatured,
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    })),
  });
}
