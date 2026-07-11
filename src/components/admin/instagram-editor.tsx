"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface InstagramFormData {
  image: string;
  link: string;
  caption: string;
  sortOrder: number;
  isActive: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-500";

export function InstagramEditor({
  id,
  initial,
}: {
  id: string | null;
  initial: InstagramFormData;
}) {
  const router = useRouter();
  const isNew = id === null;
  const [form, setForm] = useState<InstagramFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof InstagramFormData>(
    key: K,
    value: InstagramFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const payload = {
        image: form.image,
        link: form.link,
        caption: form.caption,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      const res = await fetch(
        isNew ? "/api/admin/instagram" : `/api/admin/instagram/${id}`,
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
        router.push(`/admin/instagram/${data._id}`);
      }
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "저장 실패");
    }
  }

  async function remove() {
    if (isNew) return;
    if (!confirm("이 게시물을 삭제하시겠습니까?")) return;
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/instagram/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.push("/admin/instagram");
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
          <label className={labelCls}>이미지 URL</label>
          <input
            className={field}
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
          />
          {form.image && (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.image}
                alt="미리보기"
                className="h-40 w-40 rounded-md border border-black/10 object-cover"
              />
            </div>
          )}
        </div>
        <div>
          <label className={labelCls}>게시물 링크</label>
          <input
            className={field}
            value={form.link}
            onChange={(e) => update("link", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>캡션 (마우스오버 노출 텍스트)</label>
          <textarea
            className={field}
            rows={3}
            value={form.caption}
            onChange={(e) => update("caption", e.target.value)}
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
          <div className="flex items-end pt-5">
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
