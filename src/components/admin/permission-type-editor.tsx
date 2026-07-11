"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface PermissionTypeFormData {
  id: string | null;
  code: string;
  name: string;
  category: string;
  level: "" | "basic" | "master" | "expert";
  description: string;
  sortOrder: number;
  isActive: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-500";

export function PermissionTypeEditor({
  initial,
}: {
  initial: PermissionTypeFormData;
}) {
  const router = useRouter();
  const isNew = initial.id === null;
  const [form, setForm] = useState<PermissionTypeFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof PermissionTypeFormData>(
    key: K,
    value: PermissionTypeFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  async function save() {
    setState("saving");
    setMessage("");
    const payload = {
      code: form.code,
      name: form.name,
      category: form.category,
      level: form.level === "" ? null : form.level,
      description: form.description,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
    try {
      const res = await fetch(
        isNew
          ? "/api/admin/permission-types"
          : `/api/admin/permission-types/${form.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setState("saved");
      setMessage("저장되었습니다.");
      if (isNew) {
        router.push("/admin/programs");
      } else {
        router.refresh();
      }
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "저장 실패");
    }
  }

  async function remove() {
    if (isNew || !form.id) return;
    if (!confirm("이 권한유형을 삭제하시겠습니까?")) return;
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/permission-types/${form.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.push("/admin/programs");
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "삭제 실패");
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className={labelCls}>코드</label>
            <input
              className={field}
              value={form.code}
              onChange={(e) => update("code", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>이름</label>
            <input
              className={field}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className={labelCls}>카테고리</label>
            <input
              className={field}
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>레벨</label>
            <select
              className={field}
              value={form.level}
              onChange={(e) =>
                update(
                  "level",
                  e.target.value as PermissionTypeFormData["level"],
                )
              }
            >
              <option value="">(없음)</option>
              <option value="basic">베이직</option>
              <option value="master">마스터</option>
              <option value="expert">엑스퍼트</option>
            </select>
          </div>
          <div className="w-32">
            <label className={labelCls}>정렬순서</label>
            <input
              className={field}
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                update("sortOrder", Number(e.target.value) || 0)
              }
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>설명</label>
          <textarea
            className={field}
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[14px]">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="h-4 w-4"
          />
          활성
        </label>
      </section>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-black/10 bg-white/90 py-4 backdrop-blur">
        <button
          onClick={save}
          disabled={state === "saving"}
          className="rounded-md bg-klead-primary px-6 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "저장 중…" : "저장"}
        </button>
        {!isNew && (
          <button
            onClick={remove}
            disabled={state === "saving"}
            className="rounded-md border border-red-300 px-4 py-2 text-[14px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            삭제
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
