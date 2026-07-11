import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { PermissionType } from "@/lib/db/models";

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  level: z.enum(["basic", "master", "expert"]).nullable().optional(),
  description: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

/** 권한유형 생성 */
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
  const { level, ...fields } = parsed.data;

  await connectDB();

  const exists = await PermissionType.findOne({ code: fields.code }).lean();
  if (exists) {
    return NextResponse.json(
      { error: "이미 존재하는 코드입니다." },
      { status: 409 },
    );
  }

  const doc = await PermissionType.create({
    ...fields,
    ...(level ? { level } : {}),
  });

  return NextResponse.json({ ok: true, id: doc._id.toString() });
}
