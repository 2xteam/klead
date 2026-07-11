import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { User, UserPermission, PermissionType } from "@/lib/db/models";

const updateSchema = z.object({
  role: z.enum(["member", "admin"]).optional(),
  status: z.enum(["active", "suspended", "withdrawn"]).optional(),
  notificationPrefs: z
    .object({
      notice: z.boolean(),
      marketing: z.boolean(),
      qnaReply: z.boolean(),
    })
    .optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await connectDB();
  const doc = await User.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const perms = await UserPermission.find({ userId: doc._id })
    .sort({ createdAt: -1 })
    .lean();
  const types = perms.length
    ? await PermissionType.find({
        _id: { $in: perms.map((p) => p.permissionTypeId) },
      })
        .select("name code category")
        .lean()
    : [];
  const typeMap = new Map(types.map((t) => [String(t._id), t]));

  return NextResponse.json({
    id: String(doc._id),
    name: doc.name,
    email: doc.email ?? "",
    authProvider: doc.authProvider,
    role: doc.role,
    status: doc.status,
    notificationPrefs: {
      notice: doc.notificationPrefs?.notice ?? true,
      marketing: doc.notificationPrefs?.marketing ?? false,
      qnaReply: doc.notificationPrefs?.qnaReply ?? true,
    },
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    lastLoginAt: doc.lastLoginAt
      ? new Date(doc.lastLoginAt).toISOString()
      : null,
    permissions: perms.map((p) => {
      const t = typeMap.get(String(p.permissionTypeId));
      return {
        id: String(p._id),
        name: t?.name ?? "(삭제된 권한)",
        code: t?.code ?? String(p.permissionTypeId),
        category: t?.category ?? "-",
        source: p.source,
        startAt: p.startAt ? new Date(p.startAt).toISOString() : null,
        endAt: p.endAt ? new Date(p.endAt).toISOString() : null,
      };
    }),
  });
}

export async function PUT(
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

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  await connectDB();
  const doc = await User.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true },
  ).lean();

  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id: String(doc._id) });
}
