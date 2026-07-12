"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type MenuLinkType = "internal" | "external" | "folder";

/** lean() 문서를 클라이언트로 넘기기 위한 직렬화 형태 (_id·Date → string) */
export interface SerializedMenu {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  path: string | null;
  linkType: MenuLinkType;
  externalUrl: string | null;
  depth: number;
  sortOrder: number;
  isVisible: boolean;
  icon: string | null;
  badge: string | null;
  fixed: boolean;
}

export interface MenuOption {
  id: string;
  name: string;
  depth: number;
}

export interface MenuFormData {
  id: string | null;
  name: string;
  slug: string;
  parentId: string;
  linkType: MenuLinkType;
  path: string;
  externalUrl: string;
  sortOrder: number;
  isVisible: boolean;
  badge: string;
  icon: string;
  fixed: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-700";

export function MenuEditor({
  initial,
  parents,
}: {
  initial: MenuFormData;
  parents: MenuOption[];
}) {
  const router = useRouter();
  const isNew = initial.id === null;
  const [form, setForm] = useState<MenuFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  function update<K extends keyof MenuFormData>(key: K, value: MenuFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(
        isNew ? "/api/admin/menus" : `/api/admin/menus/${initial.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            parentId: form.parentId ? form.parentId : null,
            linkType: form.linkType,
            path: form.path,
            externalUrl: form.externalUrl,
            sortOrder: Number(form.sortOrder) || 0,
            isVisible: form.isVisible,
            badge: form.badge,
            icon: form.icon,
          }),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setState("saved");
      if (isNew) {
        router.push("/admin/menus");
        router.refresh();
      } else {
        setMessage("저장되었습니다.");
        router.refresh();
      }
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "저장 실패");
    }
  }

  async function remove() {
    if (isNew) return;
    if (!confirm("이 메뉴를 삭제하시겠습니까?")) return;
    setDeleting(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/menus/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.push("/admin/menus");
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "삭제 실패");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <div>
          <label className={labelCls}>이름</label>
          <input
            className={field}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>상위 메뉴</label>
          <select
            className={field}
            value={form.parentId}
            onChange={(e) => update("parentId", e.target.value)}
          >
            <option value="">— 최상위 메뉴 —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {"  ".repeat(p.depth) + p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className={labelCls}>링크 유형</label>
            <select
              className={`${field} disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-klead-gray-400`}
              value={form.linkType}
              disabled={form.fixed}
              onChange={(e) =>
                update("linkType", e.target.value as MenuLinkType)
              }
            >
              <option value="internal">내부 링크 (internal)</option>
              <option value="external">외부 링크 (external)</option>
              <option value="folder">폴더 (folder)</option>
            </select>
          </div>
          <div className="w-32">
            <label className={labelCls}>정렬 순서</label>
            <input
              type="number"
              className={field}
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value))}
            />
          </div>
        </div>

        {form.linkType === "internal" && (
          <div>
            <label className={labelCls}>경로 (path)</label>
            <input
              className={`${field} disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-klead-gray-400`}
              placeholder="/about"
              value={form.path}
              disabled={form.fixed}
              onChange={(e) => update("path", e.target.value)}
            />
            {form.fixed && (
              <p className="mt-1 text-[12px] text-klead-gray-400">
                콘텐츠가 아닌 고정 페이지입니다. 경로는 수정할 수 없습니다.
              </p>
            )}
          </div>
        )}

        {form.linkType === "external" && (
          <div>
            <label className={labelCls}>외부 URL</label>
            <input
              className={`${field} disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-klead-gray-400`}
              placeholder="https://example.com"
              value={form.externalUrl}
              disabled={form.fixed}
              onChange={(e) => update("externalUrl", e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1">
            <label className={labelCls}>아이콘</label>
            <input
              className={field}
              value={form.icon}
              onChange={(e) => update("icon", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>배지</label>
            <input
              className={field}
              value={form.badge}
              onChange={(e) => update("badge", e.target.value)}
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-[14px]">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(e) => update("isVisible", e.target.checked)}
            className="h-4 w-4"
          />
          노출
        </label>
      </section>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-black/10 bg-white/90 py-4 backdrop-blur">
        <button
          onClick={save}
          disabled={state === "saving" || deleting}
          className="rounded-md bg-klead-primary px-6 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "저장 중…" : isNew ? "생성" : "저장"}
        </button>
        {!isNew && (
          <button
            onClick={remove}
            disabled={deleting || state === "saving"}
            className="rounded-md border border-red-300 px-4 py-2 text-[14px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "삭제 중…" : "삭제"}
          </button>
        )}
        {message && (
          <span
            className={
              state === "error"
                ? "text-[13px] text-red-600"
                : "text-[13px] text-green-600"
            }
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
