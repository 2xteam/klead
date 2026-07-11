import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Popup } from "@/lib/db/models";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional(),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  linkTarget: z.enum(["_self", "_blank"]).optional(),
  display: z
    .object({
      startDt: z.coerce.date(),
      endDt: z.coerce.date(),
      showOnce: z.boolean().default(true),
      pages: z.array(z.string()).default([]),
    })
    .optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await connectDB();
  const doc = await Popup.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({
    _id: String(doc._id),
    title: doc.title,
    body: doc.body ?? "",
    imageUrl: doc.imageUrl ?? "",
    linkUrl: doc.linkUrl ?? "",
    linkTarget: doc.linkTarget ?? "_self",
    display: {
      startDt: doc.display?.startDt ?? null,
      endDt: doc.display?.endDt ?? null,
      showOnce: doc.display?.showOnce ?? true,
      pages: doc.display?.pages ?? [],
    },
    sortOrder: doc.sortOrder ?? 0,
    isActive: doc.isActive ?? true,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  const doc = await Popup.findByIdAndUpdate(
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
  await connectDB();
  const doc = await Popup.findByIdAndDelete(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
