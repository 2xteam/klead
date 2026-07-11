import { notFound } from "next/navigation";
import Link from "next/link";
import { isValidObjectId } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { PermissionType } from "@/lib/db/models";
import {
  PermissionTypeEditor,
  type PermissionTypeFormData,
} from "@/components/admin/permission-type-editor";

export const dynamic = "force-dynamic";

export default async function AdminPermissionTypeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let initial: PermissionTypeFormData;

  if (isNew) {
    initial = {
      id: null,
      code: "",
      name: "",
      category: "",
      level: "",
      description: "",
      sortOrder: 0,
      isActive: true,
    };
  } else {
    if (!isValidObjectId(id)) notFound();
    await connectDB();
    const doc = await PermissionType.findById(id).lean();
    if (!doc) notFound();

    initial = {
      id: doc._id.toString(),
      code: doc.code,
      name: doc.name,
      category: doc.category,
      level: doc.level ?? "",
      description: doc.description ?? "",
      sortOrder: doc.sortOrder ?? 0,
      isActive: doc.isActive ?? true,
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
          {isNew ? "새 권한유형" : "권한유형 수정"}
        </h1>
        {!isNew && (
          <p className="mt-1 text-[13px] text-klead-gray-500">{initial.code}</p>
        )}
      </div>
      <PermissionTypeEditor initial={initial} />
    </div>
  );
}
