import { NextResponse } from "next/server";
import { z } from "zod";
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

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  contentCategory: z.enum(CATEGORY_ENUM).optional(),
  summary: z.string().optional(),
  body: z.string().optional(),
  thumbnail: z.string().optional(),
  isPinned: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  publishStatus: z.enum(STATUS_ENUM).optional(),
  sections: z.array(z.any()).optional(),
});

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `post-${Date.now()}`;
}

/** 게시글(content) 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await Content.find({
    type: "content",
    contentCategory: { $ne: "curator" },
    deletedAt: null,
  })
    .select("slug title contentCategory isPublic isPinned publish updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({
    items: docs.map((d) => ({
      _id: String(d._id),
      slug: d.slug,
      title: d.title,
      contentCategory: d.contentCategory ?? null,
      isPublic: d.isPublic ?? false,
      isPinned: d.isPinned ?? false,
      publishStatus: d.publish?.status ?? "draft",
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
    })),
  });
}

/** 게시글(content) 생성 — 관리자 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const data = parsed.data;

  await connectDB();

  let slug = data.slug?.trim() ? data.slug.trim() : slugify(data.title);
  const existing = await Content.findOne({ slug }).select("_id").lean();
  if (existing) {
    if (data.slug?.trim()) {
      return NextResponse.json(
        { error: "이미 사용 중인 슬러그입니다." },
        { status: 409 },
      );
    }
    slug = `${slug}-${Date.now()}`;
  }

  const created = await Content.create({
    type: "content",
    slug,
    title: data.title,
    contentCategory: data.contentCategory ?? "notice",
    summary: data.summary ?? "",
    body: data.body ?? "",
    thumbnail: data.thumbnail ?? "",
    isPinned: data.isPinned ?? false,
    isPublic: data.isPublic ?? false,
    publish: { status: data.publishStatus ?? "draft" },
    sections: data.sections ?? [],
  });

  return NextResponse.json(
    { ok: true, _id: String(created._id), slug: created.slug },
    { status: 201 },
  );
}
