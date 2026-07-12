import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Banner } from "@/lib/db/models";

const createSchema = z.object({
  name: z.string().min(1),
  subtitle: z.string().optional(),
  title: z.string().optional(),
  backgroundImage: z.string().optional(),
  logos: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

/** 배너 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await Banner.find({}).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({
    items: docs.map((d) => ({
      _id: String(d._id),
      name: d.name ?? "",
      subtitle: d.subtitle ?? "",
      title: d.title ?? "",
      backgroundImage: d.backgroundImage ?? "",
      logos: d.logos ?? [],
      isActive: d.isActive ?? true,
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
  const doc = await Banner.create(parsed.data);
  return NextResponse.json({ ok: true, _id: String(doc._id) });
}
