import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
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
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  thumbnail: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  priceDisplay: z.enum(["inquiry", "free", "amount"]).optional(),
  priceAmount: z.number().nullable().optional(),
  isPublic: z.boolean().optional(),
  isPinned: z.boolean().optional(),
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
  const doc = await Content.findOneAndUpdate(
    { slug, type: "lecture", deletedAt: null },
    { $set: parsed.data },
    { new: true },
  ).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, slug: doc.slug });
}
