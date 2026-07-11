import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { QnA, User } from "@/lib/db/models";

const updateSchema = z.object({
  status: z.enum(["pending", "answered", "closed"]).optional(),
  answer: z
    .object({
      body: z.string(),
    })
    .optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await connectDB();
  const doc = await QnA.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const author = await User.findById(doc.userId).select("name").lean();

  return NextResponse.json({
    id: doc._id.toString(),
    title: doc.title,
    body: doc.body,
    status: doc.status,
    isPrivate: doc.isPrivate,
    authorName: author?.name ?? null,
    answer: doc.answer
      ? {
          body: doc.answer.body,
          answeredAt: doc.answer.answeredAt
            ? new Date(doc.answer.answeredAt).toISOString()
            : null,
        }
      : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
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

  const update: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) {
    update.status = parsed.data.status;
  }
  if (parsed.data.answer !== undefined) {
    update["answer.body"] = parsed.data.answer.body;
    update["answer.answeredAt"] = new Date();
  }

  await connectDB();
  const doc = await QnA.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true },
  ).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id: doc._id.toString() });
}
