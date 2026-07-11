import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Menu } from "@/lib/db/models";
import type { IMenu } from "@/lib/db/models/menu";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().nullable().optional(),
  linkType: z.enum(["internal", "external", "folder"]).default("internal"),
  path: z.string().optional(),
  externalUrl: z.string().optional(),
  sortOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
  badge: z.string().optional(),
  icon: z.string().optional(),
});

function serialize(d: IMenu) {
  return {
    id: String(d._id),
    parentId: d.parentId ? String(d.parentId) : null,
    slug: d.slug,
    name: d.name,
    path: d.path ?? null,
    linkType: d.linkType,
    externalUrl: d.externalUrl ?? null,
    depth: d.depth,
    sortOrder: d.sortOrder,
    isVisible: d.isVisible,
    icon: d.icon ?? null,
    badge: d.badge ?? null,
  };
}

/** 메뉴 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await Menu.find({}).sort({ parentId: 1, sortOrder: 1 }).lean();
  return NextResponse.json({ items: docs.map(serialize) });
}

/** 메뉴 생성 — depth 계산 */
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

  let depth = 0;
  let parentId: Types.ObjectId | undefined;
  if (data.parentId) {
    if (!Types.ObjectId.isValid(data.parentId)) {
      return NextResponse.json({ error: "invalid parentId" }, { status: 422 });
    }
    const parent = await Menu.findById(data.parentId).lean();
    if (!parent) {
      return NextResponse.json({ error: "parent not found" }, { status: 422 });
    }
    depth = parent.depth + 1;
    parentId = parent._id;
  }

  const dup = await Menu.findOne({ slug: data.slug }).lean();
  if (dup) {
    return NextResponse.json(
      { error: "이미 사용 중인 슬러그입니다." },
      { status: 409 },
    );
  }

  const doc = await Menu.create({
    name: data.name,
    slug: data.slug,
    parentId,
    linkType: data.linkType,
    path: data.path || undefined,
    externalUrl: data.externalUrl || undefined,
    sortOrder: data.sortOrder,
    isVisible: data.isVisible,
    badge: data.badge || undefined,
    icon: data.icon || undefined,
    depth,
  });

  return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
}
