import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Review } from "@/lib/db/models";

// 별점·제목·내용은 구매자 작성 → 관리자 수정 불가. 노출/추천만 변경 가능.
const updateSchema = z.object({
  isVisible: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await connectDB();
  const doc = await Review.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    _id: String(doc._id),
    rating: doc.rating,
    title: doc.title ?? "",
    body: doc.body,
    isVisible: doc.isVisible,
    isFeatured: doc.isFeatured,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  await connectDB();
  const doc = await Review.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true },
  ).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, _id: String(doc._id) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await connectDB();
  const doc = await Review.findByIdAndDelete(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
