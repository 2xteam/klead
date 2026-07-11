import { notFound } from "next/navigation";
import Link from "next/link";
import { isValidObjectId } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Program, PermissionType, ProgramPermission } from "@/lib/db/models";
import {
  ProgramEditor,
  type ProgramFormData,
  type PermissionTypeOption,
} from "@/components/admin/program-editor";

export const dynamic = "force-dynamic";

export default async function AdminProgramEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  await connectDB();

  const permissionTypeDocs = await PermissionType.find({})
    .select("code name category level sortOrder")
    .sort({ sortOrder: 1, code: 1 })
    .lean();

  const permissionTypes: PermissionTypeOption[] = permissionTypeDocs.map(
    (t) => ({
      id: t._id.toString(),
      code: t.code,
      name: t.name,
      category: t.category,
      level: t.level ?? null,
    }),
  );

  let initial: ProgramFormData;

  if (isNew) {
    initial = {
      id: null,
      code: "",
      name: "",
      description: "",
      sortOrder: 0,
      isActive: true,
      priceMonthly: null,
      priceYearly: null,
      permissionTypeIds: [],
    };
  } else {
    if (!isValidObjectId(id)) notFound();
    const doc = await Program.findById(id).lean();
    if (!doc) notFound();

    const perms = await ProgramPermission.find({ programId: doc._id })
      .select("permissionTypeId")
      .lean();

    initial = {
      id: doc._id.toString(),
      code: doc.code,
      name: doc.name,
      description: doc.description ?? "",
      sortOrder: doc.sortOrder ?? 0,
      isActive: doc.isActive ?? true,
      priceMonthly: doc.priceMonthly ?? null,
      priceYearly: doc.priceYearly ?? null,
      permissionTypeIds: perms.map((p) => p.permissionTypeId.toString()),
    };
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/programs"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← 프로그램·권한
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">
          {isNew ? "새 프로그램" : "프로그램 수정"}
        </h1>
        {!isNew && (
          <p className="mt-1 text-[13px] text-klead-gray-500">{initial.code}</p>
        )}
      </div>
      <ProgramEditor initial={initial} permissionTypes={permissionTypes} />
    </div>
  );
}
