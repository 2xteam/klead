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

const createSchema = z.object({
  key: z.string().min(1),
  group: groupEnum.default("general"),
  value: z.string(),
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

function serializeValue(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/** 설정 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await SiteSetting.find().sort({ group: 1, key: 1 }).lean();

  return NextResponse.json({
    items: docs.map((d) => {
      const masked = d.key === "admin_password";
      return {
        _id: String(d._id),
        key: d.key,
        value: masked ? MASK : serializeValue(d.value),
        group: d.group ?? "general",
        description: d.description ?? "",
        updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
        masked,
      };
    }),
  });
}

/** 설정 생성 */
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

  const exists = await SiteSetting.findOne({ key: parsed.data.key }).lean();
  if (exists) {
    return NextResponse.json(
      { error: "이미 존재하는 키입니다." },
      { status: 409 },
    );
  }

  const doc = await SiteSetting.create({
    key: parsed.data.key,
    value: parseValue(parsed.data.value),
    group: parsed.data.group,
    description: parsed.data.description,
  });

  return NextResponse.json({ ok: true, key: doc.key }, { status: 201 });
}
