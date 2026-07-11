"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface PopupFormData {
  title: string;
  body: string;
  imageUrl: string;
  linkUrl: string;
  linkTarget: "_self" | "_blank";
  /** "YYYY-MM-DDTHH:mm" (datetime-local) */
  startDt: string;
  /** "YYYY-MM-DDTHH:mm" (datetime-local) */
  endDt: string;
  showOnce: boolean;
  pages: string[];
  sortOrder: number;
  isActive: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-500";

export function PopupEditor({
  id,
  initial,
}: {
  id: string | null;
  initial: PopupFormData;
}) {
  const router = useRouter();
  const isNew = id === null;
  const [form, setForm] = useState<PopupFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof PopupFormData>(
    key: K,
    value: PopupFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const payload = {
        title: form.title,
        body: form.body,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl,
        linkTarget: form.linkTarget,
        display: {
          startDt: new Date(form.startDt).toISOString(),
          endDt: new Date(form.endDt).toISOString(),
          showOnce: form.showOnce,
          pages: form.pages,
        },
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      const res = await fetch(
        isNew ? "/api/admin/popups" : `/api/admin/popups/${id}`,
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
        const data = (await res.json()) as { _id: string };
        router.push(`/admin/popups/${data._id}`);
      }
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "저장 실패");
    }
  }

  async function remove() {
    if (isNew) return;
    if (!confirm("이 팝업을 삭제하시겠습니까?")) return;
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/popups/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.push("/admin/popups");
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "삭제 실패");
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <div>
          <label className={labelCls}>제목</label>
          <input
            className={field}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>본문</label>
          <textarea
            className={field}
            rows={3}
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>이미지 URL</label>
          <input
            className={field}
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
          />
        </div>
        <div className="flex gap-6">
          <div className="flex-1">
            <label className={labelCls}>링크 URL</label>
            <input
              className={field}
              value={form.linkUrl}
              onChange={(e) => update("linkUrl", e.target.value)}
            />
          </div>
          <div className="w-40">
            <label className={labelCls}>링크 타겟</label>
            <select
              className={field}
              value={form.linkTarget}
              onChange={(e) =>
                update(
                  "linkTarget",
                  e.target.value as PopupFormData["linkTarget"],
                )
              }
            >
              <option value="_self">현재 창</option>
              <option value="_blank">새 창</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="text-[15px] font-bold">노출 설정</h2>
        <div className="flex gap-6">
          <div className="flex-1">
            <label className={labelCls}>시작일시</label>
            <input
              type="datetime-local"
              className={field}
              value={form.startDt}
              onChange={(e) => update("startDt", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>종료일시</label>
            <input
              type="datetime-local"
              className={field}
              value={form.endDt}
              onChange={(e) => update("endDt", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>노출 페이지 (줄바꿈 구분)</label>
          <textarea
            className={field}
            rows={3}
            placeholder={"/\n/classes"}
            value={form.pages.join("\n")}
            onChange={(e) =>
              update(
                "pages",
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="w-40">
            <label className={labelCls}>정렬 순서</label>
            <input
              type="number"
              className={field}
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value))}
            />
          </div>
          <div className="flex items-end gap-6 pt-5">
            <label className="flex cursor-pointer items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={form.showOnce}
                onChange={(e) => update("showOnce", e.target.checked)}
                className="h-4 w-4"
              />
              하루 동안 보지 않기
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update("isActive", e.target.checked)}
                className="h-4 w-4"
              />
              활성
            </label>
          </div>
        </div>
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
            className="rounded-md border border-black/15 px-6 py-2 text-[14px] font-semibold text-red-600 transition-opacity hover:opacity-90 disabled:opacity-50"
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
