import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Program, PermissionType, ProgramPermission } from "@/lib/db/models";

/** 프로그램 + 권한유형 목록 — 관리자 */
export async function GET() {
  await connectDB();

  const [programs, permissionTypes] = await Promise.all([
    Program.find({})
      .select("code name isActive sortOrder priceMonthly priceYearly")
      .sort({ sortOrder: 1, code: 1 })
      .lean(),
    PermissionType.find({})
      .select("code name category level isActive sortOrder")
      .sort({ sortOrder: 1, code: 1 })
      .lean(),
  ]);

  return NextResponse.json({
    programs: programs.map((p) => ({
      id: p._id.toString(),
      code: p.code,
      name: p.name,
      isActive: p.isActive ?? true,
      sortOrder: p.sortOrder ?? 0,
      priceMonthly: p.priceMonthly ?? null,
      priceYearly: p.priceYearly ?? null,
    })),
    permissionTypes: permissionTypes.map((t) => ({
      id: t._id.toString(),
      code: t.code,
      name: t.name,
      category: t.category,
      level: t.level ?? null,
      isActive: t.isActive ?? true,
      sortOrder: t.sortOrder ?? 0,
    })),
  });
}

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  priceMonthly: z.number().nullable().optional(),
  priceYearly: z.number().nullable().optional(),
  permissionTypeIds: z.array(z.string()).default([]),
});

/** 프로그램 생성 (+ 부여 권한 매핑) */
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
  const { permissionTypeIds, priceMonthly, priceYearly, ...fields } =
    parsed.data;

  await connectDB();

  const exists = await Program.findOne({ code: fields.code }).lean();
  if (exists) {
    return NextResponse.json(
      { error: "이미 존재하는 코드입니다." },
      { status: 409 },
    );
  }

  const program = await Program.create({
    ...fields,
    ...(priceMonthly != null ? { priceMonthly } : {}),
    ...(priceYearly != null ? { priceYearly } : {}),
  });

  if (permissionTypeIds.length > 0) {
    await ProgramPermission.insertMany(
      permissionTypeIds.map((permissionTypeId) => ({
        programId: program._id,
        permissionTypeId,
      })),
    );
  }

  return NextResponse.json({ ok: true, id: program._id.toString() });
}
