import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { LectureAccess, Content, User } from "@/lib/db/models";
import { hashKey, randomCode } from "@/lib/content/lecture-access";

const createSchema = z.object({
  contentId: z.string().min(1),
  type: z.enum(["member", "secret"]),
  userId: z.string().optional(),
  key: z.string().optional(),
  startAt: z.string().optional(), // ISO or ""
  endAt: z.string().optional(), // ISO or "" (없으면 무기한)
  note: z.string().optional(),
  gateTtlHours: z.number().int().min(1).max(8760).optional(), // 시크릿 재입력 주기(시간)
});

/** 열람권 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await LectureAccess.find({})
    .populate("contentId", "title slug")
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    items: docs.map((d) => {
      const c = d.contentId as unknown as {
        _id: Types.ObjectId;
        title?: string;
        slug?: string;
      } | null;
      const u = d.userId as unknown as { name?: string; email?: string } | null;
      return {
        _id: String(d._id),
        lectureTitle: c?.title ?? "(삭제된 강의)",
        lectureSlug: c?.slug ?? "",
        userName: u?.name ?? null,
        source: d.source,
        code: d.code,
        hasSecret: !!d.secretKeyHash,
        secretKey: d.secretKey ?? null,
        gateTtlHours: d.gateTtlHours ?? 24,
        startAt: d.startAt ? new Date(d.startAt).toISOString() : null,
        endAt: d.endAt ? new Date(d.endAt).toISOString() : null,
        note: d.note ?? "",
        isActive: d.isActive,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
      };
    }),
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
  const d = parsed.data;

  if (!Types.ObjectId.isValid(d.contentId)) {
    return NextResponse.json({ error: "강의를 선택하세요." }, { status: 422 });
  }

  await connectDB();
  const lecture = await Content.findOne({ _id: d.contentId, type: "lecture" })
    .select("slug")
    .lean();
  if (!lecture) {
    return NextResponse.json({ error: "강의를 찾을 수 없습니다." }, { status: 404 });
  }

  const startAt = d.startAt ? new Date(d.startAt) : null;
  const endAt = d.endAt ? new Date(d.endAt) : null;

  const doc: Record<string, unknown> = {
    contentId: d.contentId,
    code: randomCode(),
    startAt,
    endAt,
    isActive: true,
    note: d.note,
  };

  if (d.type === "member") {
    if (!d.userId || !Types.ObjectId.isValid(d.userId)) {
      return NextResponse.json({ error: "회원을 선택하세요." }, { status: 422 });
    }
    const u = await User.findById(d.userId).select("_id").lean();
    if (!u) {
      return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
    }
    doc.userId = d.userId;
    doc.source = "manual";
  } else {
    if (!d.key || d.key.trim().length < 4) {
      return NextResponse.json(
        { error: "시크릿 키는 4자 이상 입력하세요." },
        { status: 422 },
      );
    }
    doc.source = "secret";
    doc.secretKeyHash = hashKey(d.key.trim());
    doc.secretKey = d.key.trim(); // 관리자 표시용(공유 코드)
    doc.gateTtlHours = d.gateTtlHours ?? 24;
    doc.userId = null;
  }

  const created = await LectureAccess.create(doc);
  const base = `/lecture/${lecture.slug}`;
  const shareUrl =
    d.type === "secret" ? `${base}?access=${created.code}` : base;

  return NextResponse.json({ ok: true, _id: String(created._id), shareUrl });
}
