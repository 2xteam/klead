import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Popup } from "@/lib/db/models";

const createSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  linkTarget: z.enum(["_self", "_blank"]).default("_self"),
  display: z.object({
    startDt: z.coerce.date(),
    endDt: z.coerce.date(),
    showOnce: z.boolean().default(true),
    pages: z.array(z.string()).default([]),
  }),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

/** 팝업 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await Popup.find({})
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return NextResponse.json({
    items: docs.map((d) => ({
      _id: String(d._id),
      title: d.title,
      isActive: d.isActive ?? false,
      startDt: d.display?.startDt ?? null,
      endDt: d.display?.endDt ?? null,
      sortOrder: d.sortOrder ?? 0,
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

  await connectDB();
  const doc = await Popup.create(parsed.data);
  return NextResponse.json({ ok: true, _id: String(doc._id) });
}
