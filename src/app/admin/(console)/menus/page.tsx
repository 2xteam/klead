import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Menu } from "@/lib/db/models";
import type { SerializedMenu } from "@/components/admin/menu-editor";

export const dynamic = "force-dynamic";

const LINK_TYPE_LABEL: Record<SerializedMenu["linkType"], string> = {
  internal: "내부",
  external: "외부",
  folder: "폴더",
};

export default async function AdminMenusPage() {
  await connectDB();
  const docs = await Menu.find({})
    .sort({ parentId: 1, sortOrder: 1 })
    .lean();

  const items: SerializedMenu[] = docs.map((d) => ({
    id: String(d._id),
    parentId: d.parentId ? String(d.parentId) : null,
    slug: d.slug,
    name: d.name,
    path: d.path ?? null,
    linkType: d.linkType,
    externalUrl: d.externalUrl ?? null,
    depth: d.depth,
    sortOrder: d.sortOrder,
    isVisible: d.isVisible,
    icon: d.icon ?? null,
    badge: d.badge ?? null,
    fixed: d.fixed ?? false,
  }));

  // parentId 기준 자식 그룹화 후 sortOrder 순 정렬
  const byParent = new Map<string, SerializedMenu[]>();
  for (const m of items) {
    const key = m.parentId ?? "root";
    const arr = byParent.get(key) ?? [];
    arr.push(m);
    byParent.set(key, arr);
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // 트리 순서(pre-order)로 평탄화
  const ordered: SerializedMenu[] = [];
  const walk = (parentKey: string) => {
    for (const node of byParent.get(parentKey) ?? []) {
      ordered.push(node);
      walk(node.id);
    }
  };
  walk("root");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold">메뉴 관리</h1>
          <p className="mt-1 text-[13px] text-klead-gray-500">
            총 {items.length}개 · 무한 depth 트리
          </p>
        </div>
        <Link
          href="/admin/menus/new"
          className="rounded-md bg-klead-primary px-4 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          새 메뉴
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">이름</th>
              <th className="px-4 py-3 font-semibold">유형</th>
              <th className="px-4 py-3 font-semibold">경로/URL</th>
              <th className="px-4 py-3 font-semibold">노출</th>
              <th className="px-4 py-3 font-semibold">순서</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[13px] text-klead-gray-400"
                >
                  등록된 메뉴가 없습니다.
                </td>
              </tr>
            ) : (
              ordered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]"
                >
                  <td className="px-4 py-3">
                    <span style={{ paddingLeft: `${m.depth * 20}px` }}>
                      {m.depth > 0 && (
                        <span className="text-klead-gray-400">└ </span>
                      )}
                      <Link
                        href={`/admin/menus/${m.id}`}
                        className="font-medium hover:text-klead-primary hover:underline"
                      >
                        {m.name}
                      </Link>
                      {m.fixed && (
                        <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium text-klead-gray-500">
                          고정
                        </span>
                      )}
                      {m.badge && (
                        <span className="ml-2 rounded-full bg-klead-primary/10 px-2 py-0.5 text-[11px] font-medium text-klead-primary">
                          {m.badge}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-klead-gray-500">
                    {LINK_TYPE_LABEL[m.linkType]}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-klead-gray-400">
                    {m.linkType === "internal"
                      ? (m.path ?? "-")
                      : m.linkType === "external"
                        ? (m.externalUrl ?? "-")
                        : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        m.isVisible
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700"
                          : "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500"
                      }
                    >
                      {m.isVisible ? "노출" : "숨김"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-klead-gray-500">
                    {m.sortOrder}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/menus/${m.id}`}
                        className="text-[13px] font-medium text-klead-primary hover:underline"
                      >
                        수정
                      </Link>
                      {m.linkType === "internal" && m.path && (
                        <a
                          href={m.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium text-klead-gray-500 hover:underline"
                        >
                          보기
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
