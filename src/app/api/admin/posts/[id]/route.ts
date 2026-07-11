import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";

const CATEGORY_ENUM = [
  "notice",
  "resource",
  "event",
  "guide",
  "community",
] as const;

const STATUS_ENUM = ["draft", "scheduled", "published", "expired"] as const;

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  contentCategory: z.enum(CATEGORY_ENUM).optional(),
  summary: z.string().optional(),
  body: z.string().optional(),
  thumbnail: z.string().optional(),
  isPinned: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  publishStatus: z.enum(STATUS_ENUM).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await connectDB();
  const doc = await Content.findOne({
    _id: id,
    type: "content",
    deletedAt: null,
  }).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({
    _id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    contentCategory: doc.contentCategory ?? null,
    summary: doc.summary ?? "",
    body: doc.body ?? "",
    thumbnail: doc.thumbnail ?? "",
    isPinned: doc.isPinned ?? false,
    isPublic: doc.isPublic ?? false,
    publishStatus: doc.publish?.status ?? "draft",
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
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
  const data = parsed.data;

  await connectDB();

  // 슬러그 변경 시 고유성 검사
  if (data.slug?.trim()) {
    const dupe = await Content.findOne({
      slug: data.slug.trim(),
      _id: { $ne: id },
    })
      .select("_id")
      .lean();
    if (dupe) {
      return NextResponse.json(
        { error: "이미 사용 중인 슬러그입니다." },
        { status: 409 },
      );
    }
  }

  const set: Record<string, unknown> = {};
  if (data.title !== undefined) set.title = data.title;
  if (data.slug?.trim()) set.slug = data.slug.trim();
  if (data.contentCategory !== undefined)
    set.contentCategory = data.contentCategory;
  if (data.summary !== undefined) set.summary = data.summary;
  if (data.body !== undefined) set.body = data.body;
  if (data.thumbnail !== undefined) set.thumbnail = data.thumbnail;
  if (data.isPinned !== undefined) set.isPinned = data.isPinned;
  if (data.isPublic !== undefined) set.isPublic = data.isPublic;
  if (data.publishStatus !== undefined)
    set["publish.status"] = data.publishStatus;

  const doc = await Content.findOneAndUpdate(
    { _id: id, type: "content", deletedAt: null },
    { $set: set },
    { new: true },
  ).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, _id: String(doc._id), slug: doc.slug });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await connectDB();
  const doc = await Content.findOneAndUpdate(
    { _id: id, type: "content", deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true },
  ).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, _id: String(doc._id) });
}
