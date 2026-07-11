import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { SiteSetting } from "@/lib/db/models";

const MASK = "********";

const groupEnum = z.enum([
  "general",
  "header",
  "footer",
  "sns",
  "seo",
  "company",
]);

const updateSchema = z.object({
  value: z.string(),
  group: groupEnum.optional(),
  description: z.string().optional(),
});

/** 문자열을 JSON으로 파싱 시도, 실패하면 문자열 그대로 저장 */
function parseValue(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

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

  const set: Record<string, unknown> = {};
  if (parsed.data.group !== undefined) set.group = parsed.data.group;
  if (parsed.data.description !== undefined)
    set.description = parsed.data.description;

  // admin_password: 마스킹 값 그대로 저장 방지 (기존 비밀번호 유지)
  const isMaskedPassword =
    key === "admin_password" && parsed.data.value === MASK;
  if (!isMaskedPassword) {
    set.value = parseValue(parsed.data.value);
  }

  await connectDB();
  const doc = await SiteSetting.findOneAndUpdate(
    { key },
    { $set: set },
    { new: true },
  ).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, key: doc.key });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  if (key === "admin_password") {
    return NextResponse.json(
      { error: "관리자 비밀번호 설정은 삭제할 수 없습니다." },
      { status: 400 },
    );
  }

  await connectDB();
  const doc = await SiteSetting.findOneAndDelete({ key }).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, key });
}
