import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Content, ContentPermission } from "@/lib/db/models";
import type { IPageSection } from "@/lib/db/models/content";

const sectionItemSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  sortOrder: z.number().default(0),
});

const sectionSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  items: z.array(sectionItemSchema).optional(),
  sortOrder: z.number().default(0),
});

const updateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  thumbnail: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  priceDisplay: z.enum(["inquiry", "free", "amount"]).optional(),
  priceAmount: z.number().nullable().optional(),
  isPublic: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  permissionTypeId: z.string().optional(), // "" = 권한 없음(무료)
  sections: z.array(sectionSchema).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await connectDB();
  const doc = await Content.findOne({
    slug,
    type: "lecture",
    deletedAt: null,
  }).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary ?? "",
    thumbnail: doc.thumbnail ?? "",
    lectureCategory: doc.lectureCategory ?? null,
    priceDisplay: doc.priceDisplay ?? "inquiry",
    priceAmount: doc.priceAmount ?? null,
    isPublic: doc.isPublic ?? false,
    isPinned: doc.isPinned ?? false,
    permissionTypeId: doc.permissionTypeId ? String(doc.permissionTypeId) : "",
    sections: (doc.sections ?? []) as IPageSection[],
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
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
  const current = await Content.findOne({
    slug,
    type: "lecture",
    deletedAt: null,
  })
    .select("_id")
    .lean();
  if (!current) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { slug: newSlug, permissionTypeId, ...rest } = parsed.data;
  const set: Record<string, unknown> = { ...rest };

  // 권한 매핑: Content.permissionTypeId + ContentPermission 동기화
  if (permissionTypeId !== undefined) {
    const pid =
      permissionTypeId && Types.ObjectId.isValid(permissionTypeId)
        ? new Types.ObjectId(permissionTypeId)
        : null;
    set.permissionTypeId = pid;
    await ContentPermission.deleteMany({ contentId: current._id });
    if (pid) {
      await ContentPermission.create({
        contentId: current._id,
        permissionTypeId: pid,
      });
    }
  }

  if (newSlug && newSlug.trim() && newSlug.trim() !== slug) {
    const dupe = await Content.findOne({
      slug: newSlug.trim(),
      _id: { $ne: current._id },
    })
      .select("_id")
      .lean();
    if (dupe) {
      return NextResponse.json(
        { error: "이미 사용 중인 슬러그입니다." },
        { status: 409 },
      );
    }
    set.slug = newSlug.trim();
  }

  const doc = await Content.findByIdAndUpdate(
    current._id,
    { $set: set },
    { new: true },
  ).lean();

  return NextResponse.json({ ok: true, slug: doc?.slug });
}
