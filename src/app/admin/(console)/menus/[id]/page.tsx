import { notFound } from "next/navigation";
import Link from "next/link";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Menu } from "@/lib/db/models";
import {
  MenuEditor,
  type MenuFormData,
  type MenuOption,
} from "@/components/admin/menu-editor";

export const dynamic = "force-dynamic";

const EMPTY_FORM: MenuFormData = {
  id: null,
  name: "",
  slug: "",
  parentId: "",
  linkType: "internal",
  path: "",
  externalUrl: "",
  sortOrder: 0,
  isVisible: true,
  badge: "",
  icon: "",
};

export default async function AdminMenuEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  await connectDB();

  // 상위 메뉴 선택용 전체 목록 (자기 자신 제외)
  const all = await Menu.find({})
    .sort({ parentId: 1, sortOrder: 1 })
    .lean();
  const parents: MenuOption[] = all
    .filter((m) => isNew || String(m._id) !== id)
    .map((m) => ({
      id: String(m._id),
      name: m.name,
      depth: m.depth,
    }));

  let initial: MenuFormData = EMPTY_FORM;
  let heading = "새 메뉴";
  let sub = "새 메뉴를 생성합니다.";

  if (!isNew) {
    if (!Types.ObjectId.isValid(id)) notFound();
    const doc = await Menu.findById(id).lean();
    if (!doc) notFound();
    initial = {
      id: String(doc._id),
      name: doc.name,
      slug: doc.slug,
      parentId: doc.parentId ? String(doc.parentId) : "",
      linkType: doc.linkType,
      path: doc.path ?? "",
      externalUrl: doc.externalUrl ?? "",
      sortOrder: doc.sortOrder,
      isVisible: doc.isVisible,
      badge: doc.badge ?? "",
      icon: doc.icon ?? "",
    };
    heading = "메뉴 수정";
    sub = `/${doc.slug}`;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/menus"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← 메뉴 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">{heading}</h1>
        <p className="mt-1 text-[13px] text-klead-gray-400">{sub}</p>
      </div>
      <MenuEditor initial={initial} parents={parents} />
    </div>
  );
}
