import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Menu } from "@/lib/db/models";

const updateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
  linkType: z.enum(["internal", "external", "folder"]),
  path: z.string().optional(),
  externalUrl: z.string().optional(),
  sortOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
  badge: z.string().optional(),
  icon: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  await connectDB();
  const doc = await Menu.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: String(doc._id),
    parentId: doc.parentId ? String(doc.parentId) : null,
    slug: doc.slug,
    name: doc.name,
    path: doc.path ?? null,
    linkType: doc.linkType,
    externalUrl: doc.externalUrl ?? null,
    depth: doc.depth,
    sortOrder: doc.sortOrder,
    isVisible: doc.isVisible,
    icon: doc.icon ?? null,
    badge: doc.badge ?? null,
    fixed: doc.fixed ?? false,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
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

  let depth = 0;
  let parentId: Types.ObjectId | null = null;
  if (data.parentId) {
    if (!Types.ObjectId.isValid(data.parentId)) {
      return NextResponse.json({ error: "invalid parentId" }, { status: 422 });
    }
    if (data.parentId === id) {
      return NextResponse.json(
        { error: "자기 자신을 상위 메뉴로 지정할 수 없습니다." },
        { status: 422 },
      );
    }
    const parent = await Menu.findById(data.parentId).lean();
    if (!parent) {
      return NextResponse.json({ error: "parent not found" }, { status: 422 });
    }
    depth = parent.depth + 1;
    parentId = parent._id;
  }

  const current = await Menu.findById(id).lean();
  if (!current) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // slug는 UI에서 관리하지 않음 — 제공 시에만 중복 검사, 아니면 기존 유지
  if (data.slug && data.slug.trim()) {
    const dup = await Menu.findOne({
      slug: data.slug.trim(),
      _id: { $ne: id },
    }).lean();
    if (dup) {
      return NextResponse.json(
        { error: "이미 사용 중인 슬러그입니다." },
        { status: 409 },
      );
    }
  }

  const set: Record<string, unknown> = {
    name: data.name,
    parentId,
    sortOrder: data.sortOrder,
    isVisible: data.isVisible,
    badge: data.badge || undefined,
    icon: data.icon || undefined,
    depth,
  };
  if (data.slug && data.slug.trim()) set.slug = data.slug.trim();

  // 고정(시스템) 메뉴는 경로/링크유형을 수정할 수 없음 — 기존값 유지
  if (!current.fixed) {
    set.linkType = data.linkType;
    set.path = data.path || undefined;
    set.externalUrl = data.externalUrl || undefined;
  }

  const doc = await Menu.findByIdAndUpdate(id, { $set: set }, { new: true }).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id: String(doc._id) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await connectDB();

  const childCount = await Menu.countDocuments({ parentId: id });
  if (childCount > 0) {
    return NextResponse.json(
      { error: "하위 메뉴가 있어 삭제할 수 없습니다. 먼저 하위 메뉴를 삭제하세요." },
      { status: 409 },
    );
  }

  const doc = await Menu.findByIdAndDelete(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
