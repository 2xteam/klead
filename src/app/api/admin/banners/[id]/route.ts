import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Banner } from "@/lib/db/models";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  title: z.string().optional(),
  backgroundImage: z.string().optional(),
  logos: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await connectDB();
  const doc = await Banner.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    _id: String(doc._id),
    name: doc.name ?? "",
    subtitle: doc.subtitle ?? "",
    title: doc.title ?? "",
    backgroundImage: doc.backgroundImage ?? "",
    logos: doc.logos ?? [],
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
  const doc = await Banner.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true },
  ).lean();
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, _id: String(doc._id) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await connectDB();
  const doc = await Banner.findByIdAndDelete(id).lean();
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
