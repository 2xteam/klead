"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ProgramFormData {
  id: string | null;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  priceMonthly: number | null;
  priceYearly: number | null;
  permissionTypeIds: string[];
}

export interface PermissionTypeOption {
  id: string;
  code: string;
  name: string;
  category: string;
  level: string | null;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-500";

function numOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function ProgramEditor({
  initial,
  permissionTypes,
}: {
  initial: ProgramFormData;
  permissionTypes: PermissionTypeOption[];
}) {
  const router = useRouter();
  const isNew = initial.id === null;
  const [form, setForm] = useState<ProgramFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof ProgramFormData>(
    key: K,
    value: ProgramFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  function togglePermission(id: string, checked: boolean) {
    setForm((f) => ({
      ...f,
      permissionTypeIds: checked
        ? [...f.permissionTypeIds, id]
        : f.permissionTypeIds.filter((x) => x !== id),
    }));
    setState("idle");
  }

  async function save() {
    setState("saving");
    setMessage("");
    const payload = {
      code: form.code,
      name: form.name,
      description: form.description,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      priceMonthly: form.priceMonthly,
      priceYearly: form.priceYearly,
      permissionTypeIds: form.permissionTypeIds,
    };
    try {
      const res = await fetch(
        isNew ? "/api/admin/programs" : `/api/admin/programs/${form.id}`,
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
    if (!confirm("이 프로그램을 삭제하시겠습니까?")) return;
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/programs/${form.id}`, {
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
        <div>
          <label className={labelCls}>설명</label>
          <textarea
            className={field}
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className={labelCls}>월 요금 (원)</label>
            <input
              className={field}
              type="number"
              value={form.priceMonthly ?? ""}
              onChange={(e) =>
                update("priceMonthly", numOrNull(e.target.value))
              }
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>연 요금 (원)</label>
            <input
              className={field}
              type="number"
              value={form.priceYearly ?? ""}
              onChange={(e) => update("priceYearly", numOrNull(e.target.value))}
            />
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

      <section className="space-y-3 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="text-[15px] font-bold">부여 권한 유형</h2>
        {permissionTypes.length === 0 ? (
          <p className="text-[13px] text-klead-gray-500">
            등록된 권한유형이 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {permissionTypes.map((t) => {
              const checked = form.permissionTypeIds.includes(t.id);
              return (
                <label
                  key={t.id}
                  className="flex cursor-pointer items-start gap-2 rounded-md border border-black/10 p-3 text-[14px] hover:bg-[#fafafa]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => togglePermission(t.id, e.target.checked)}
                    className="mt-0.5 h-4 w-4"
                  />
                  <span>
                    <span className="font-medium">{t.name}</span>
                    <span className="ml-1 font-mono text-[12px] text-klead-gray-500">
                      {t.code}
                    </span>
                    <span className="block text-[12px] text-klead-gray-500">
                      {t.category}
                      {t.level ? ` · ${t.level}` : ""}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
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
