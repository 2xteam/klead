import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
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

const createSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1),
  summary: z.string().optional(),
  thumbnail: z.string().optional(),
  isPublic: z.boolean().default(false),
  sections: z.array(sectionSchema).default([]),
});

function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "curator"}-${Date.now()}`;
}

/** 큐레이터 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await Content.find({
    type: "content",
    contentCategory: "curator",
    deletedAt: null,
  })
    .select("slug title summary isPublic sections updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({
    items: docs.map((d) => ({
      slug: d.slug,
      title: d.title,
      summary: d.summary ?? "",
      isPublic: d.isPublic ?? false,
      sectionCount: d.sections?.length ?? 0,
      updatedAt: d.updatedAt,
    })),
  });
}

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

  const { slug, ...rest } = parsed.data;
  await connectDB();
  const doc = await Content.create({
    ...rest,
    slug: slug && slug.length > 0 ? slug : slugify(rest.title),
    type: "content",
    contentCategory: "curator",
  });

  return NextResponse.json({ ok: true, slug: doc.slug });
}
