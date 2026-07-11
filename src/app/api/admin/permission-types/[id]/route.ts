import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/db/mongodb";
import { PermissionType, ProgramPermission } from "@/lib/db/models";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await connectDB();
  const doc = await PermissionType.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    category: doc.category,
    level: doc.level ?? null,
    description: doc.description ?? "",
    sortOrder: doc.sortOrder ?? 0,
    isActive: doc.isActive ?? true,
  });
}

const updateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  level: z.enum(["basic", "master", "expert"]).nullable().optional(),
  description: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
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
  const { level, ...fields } = parsed.data;

  await connectDB();

  const dup = await PermissionType.findOne({
    code: fields.code,
    _id: { $ne: id },
  }).lean();
  if (dup) {
    return NextResponse.json(
      { error: "이미 존재하는 코드입니다." },
      { status: 409 },
    );
  }

  const doc = await PermissionType.findByIdAndUpdate(
    id,
    {
      $set: level ? { ...fields, level } : fields,
      ...(level ? {} : { $unset: { level: "" } }),
    },
    { new: true },
  ).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
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
  const doc = await PermissionType.findByIdAndDelete(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await ProgramPermission.deleteMany({ permissionTypeId: id });

  return NextResponse.json({ ok: true });
}
