import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import type { IPageSection } from "@/lib/db/models/content";
import { SECTION_TYPES } from "@/lib/db/schemas/common";

export const dynamic = "force-dynamic";

const sectionItemSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  linkLabel: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  sortOrder: z.number().default(0),
});

const sectionSchema = z.object({
  key: z.string(),
  type: z.enum(SECTION_TYPES).optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  imageUrl: z.string().optional(),
  backgroundImage: z.string().optional(),
  theme: z.enum(["light", "dark"]).optional(),
  imagePosition: z.enum(["left", "right"]).optional(),
  lazy: z.boolean().optional(),
  items: z.array(sectionItemSchema).optional(),
  sortOrder: z.number().default(0),
});

const updateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  thumbnail: z.string().optional(),
  isPublic: z.boolean().optional(),
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
    type: "content",
    contentCategory: "curator",
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
    isPublic: doc.isPublic ?? false,
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
    type: "content",
    contentCategory: "curator",
    deletedAt: null,
  })
    .select("_id")
    .lean();
  if (!current) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { slug: newSlug, ...rest } = parsed.data;
  const set: Record<string, unknown> = { ...rest };
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await connectDB();
  const doc = await Content.findOneAndUpdate(
    { slug, type: "content", contentCategory: "curator", deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true },
  ).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
