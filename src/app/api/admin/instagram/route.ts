import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { InstagramPost } from "@/lib/db/models";

const createSchema = z.object({
  image: z.string().min(1),
  link: z.string().optional(),
  caption: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

/** 인스타그램 게시물 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await InstagramPost.find({})
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return NextResponse.json({
    items: docs.map((d) => ({
      _id: String(d._id),
      image: d.image ?? "",
      link: d.link ?? "",
      caption: d.caption ?? "",
      isActive: d.isActive ?? false,
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
  const doc = await InstagramPost.create(parsed.data);
  return NextResponse.json({ ok: true, _id: String(doc._id) });
}
