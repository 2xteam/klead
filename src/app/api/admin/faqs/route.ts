import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Faq } from "@/lib/db/models";

/** FAQ 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await Faq.find({})
    .select("category question isPublished sortOrder updatedAt")
    .sort({ sortOrder: 1, updatedAt: -1 })
    .lean();

  return NextResponse.json({
    items: docs.map((d) => ({
      _id: String(d._id),
      category: d.category ?? null,
      question: d.question,
      isPublished: d.isPublished ?? false,
      sortOrder: d.sortOrder ?? 0,
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
    })),
  });
}

const createSchema = z.object({
  category: z.string().optional(),
  question: z.string().min(1),
  answer: z.string().min(1),
  sortOrder: z.number().default(0),
  isPublished: z.boolean().default(true),
});

/** FAQ 생성 — 관리자 */
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
  const doc = await Faq.create(parsed.data);
  return NextResponse.json({ ok: true, _id: String(doc._id) }, { status: 201 });
}
