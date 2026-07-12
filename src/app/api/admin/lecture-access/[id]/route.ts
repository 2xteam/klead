import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { LectureAccess } from "@/lib/db/models";
import { hashKey } from "@/lib/content/lecture-access";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  startAt: z.string().optional(), // ISO 또는 "" (해제)
  endAt: z.string().optional(), // ISO 또는 "" (무기한)
  key: z.string().optional(), // 시크릿키 변경(빈 문자열이면 변경 안 함)
  note: z.string().optional(),
  gateTtlHours: z.number().int().min(1).max(8760).optional(),
});

/** 열람권 수정 — 활성/기간/시크릿키/메모 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }
  const d = parsed.data;

  await connectDB();
  const current = await LectureAccess.findById(id).select("source").lean();
  if (!current) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const set: Record<string, unknown> = {};
  if (d.isActive !== undefined) set.isActive = d.isActive;
  if (d.startAt !== undefined) set.startAt = d.startAt ? new Date(d.startAt) : null;
  if (d.endAt !== undefined) set.endAt = d.endAt ? new Date(d.endAt) : null;
  if (d.note !== undefined) set.note = d.note;
  if (d.gateTtlHours !== undefined) set.gateTtlHours = d.gateTtlHours;
  // 시크릿키 변경은 시크릿형에서만, 값이 있을 때만
  if (d.key && d.key.trim() && current.source === "secret") {
    if (d.key.trim().length < 4) {
      return NextResponse.json(
        { error: "시크릿 키는 4자 이상 입력하세요." },
        { status: 422 },
      );
    }
    set.secretKeyHash = hashKey(d.key.trim());
    set.secretKey = d.key.trim();
  }

  const doc = await LectureAccess.findByIdAndUpdate(id, { $set: set }, {
    new: true,
  }).lean();
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await connectDB();
  const doc = await LectureAccess.findByIdAndDelete(id).lean();
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
