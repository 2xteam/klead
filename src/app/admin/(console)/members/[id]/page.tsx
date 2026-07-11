import { notFound } from "next/navigation";
import Link from "next/link";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { User, UserPermission, PermissionType } from "@/lib/db/models";
import {
  MemberEditor,
  type MemberFormData,
  type MemberPermissionView,
} from "@/components/admin/member-editor";

export const dynamic = "force-dynamic";

export default async function AdminMemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const doc = await User.findById(id).lean();
  if (!doc) notFound();

  const perms = await UserPermission.find({ userId: doc._id })
    .sort({ createdAt: -1 })
    .lean();

  const typeIds = perms.map((p) => p.permissionTypeId);
  const types = typeIds.length
    ? await PermissionType.find({ _id: { $in: typeIds } })
        .select("name code category")
        .lean()
    : [];
  const typeMap = new Map(types.map((t) => [String(t._id), t]));

  const permissions: MemberPermissionView[] = perms.map((p) => {
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
  });

  const initial: MemberFormData = {
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
    permissions,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/members"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← 회원 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">회원 상세</h1>
        <p className="mt-1 text-[13px] text-klead-gray-400">{initial.name}</p>
      </div>
      <MemberEditor initial={initial} />
    </div>
  );
}
