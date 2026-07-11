import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { Program, ProgramPermission } from "@/lib/db/models";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await connectDB();
  const doc = await Program.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const perms = await ProgramPermission.find({ programId: doc._id })
    .select("permissionTypeId")
    .lean();

  return NextResponse.json({
    id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    description: doc.description ?? "",
    sortOrder: doc.sortOrder ?? 0,
    isActive: doc.isActive ?? true,
    priceMonthly: doc.priceMonthly ?? null,
    priceYearly: doc.priceYearly ?? null,
    permissionTypeIds: perms.map((p) => p.permissionTypeId.toString()),
  });
}

const updateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  priceMonthly: z.number().nullable().optional(),
  priceYearly: z.number().nullable().optional(),
  permissionTypeIds: z.array(z.string()).default([]),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

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
  const { permissionTypeIds, priceMonthly, priceYearly, ...fields } =
    parsed.data;

  await connectDB();

  const dup = await Program.findOne({
    code: fields.code,
    _id: { $ne: id },
  }).lean();
  if (dup) {
    return NextResponse.json(
      { error: "이미 존재하는 코드입니다." },
      { status: 409 },
    );
  }

  const unset: Record<string, ""> = {};
  const set: Record<string, unknown> = { ...fields };
  if (priceMonthly != null) set.priceMonthly = priceMonthly;
  else unset.priceMonthly = "";
  if (priceYearly != null) set.priceYearly = priceYearly;
  else unset.priceYearly = "";

  const doc = await Program.findByIdAndUpdate(
    id,
    {
      $set: set,
      ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
    },
    { new: true },
  ).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // ProgramPermission 세트 동기화 (기존 삭제 후 재생성)
  await ProgramPermission.deleteMany({ programId: doc._id });
  if (permissionTypeIds.length > 0) {
    await ProgramPermission.insertMany(
      permissionTypeIds.map((permissionTypeId) => ({
        programId: doc._id,
        permissionTypeId,
      })),
    );
  }

  return NextResponse.json({ ok: true, id: doc._id.toString() });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await connectDB();
  const doc = await Program.findByIdAndDelete(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await ProgramPermission.deleteMany({ programId: id });

  return NextResponse.json({ ok: true });
}
