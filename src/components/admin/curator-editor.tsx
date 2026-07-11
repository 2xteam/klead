"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IPageSection } from "@/lib/db/models/content";
import { SectionsEditor } from "@/components/admin/sections-editor";

export interface CuratorFormData {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  isPublic: boolean;
  sections: IPageSection[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-500";

export function CuratorEditor({
  slug,
  initial,
}: {
  /** null이면 새 큐레이터(POST), 아니면 기존(PUT) */
  slug: string | null;
  initial: CuratorFormData;
}) {
  const router = useRouter();
  const isNew = slug === null;
  const [form, setForm] = useState<CuratorFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof CuratorFormData>(
    key: K,
    value: CuratorFormData[K],
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
        summary: form.summary,
        thumbnail: form.thumbnail,
        isPublic: form.isPublic,
        sections: form.sections,
      };
      const res = await fetch(
        isNew ? "/api/admin/curators" : `/api/admin/curators/${slug}`,
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
        const data = (await res.json()) as { slug: string };
        router.push(`/admin/curators/${data.slug}`);
      }
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "저장 실패");
    }
  }

  async function remove() {
    if (isNew) return;
    if (!confirm("이 큐레이터를 삭제하시겠습니까?")) return;
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/curators/${slug}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.push("/admin/curators");
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
          <label className={labelCls}>이름</label>
          <input
            className={field}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>직함</label>
          <input
            className={field}
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>썸네일 URL</label>
          <input
            className={field}
            value={form.thumbnail}
            onChange={(e) => update("thumbnail", e.target.value)}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[14px]">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => update("isPublic", e.target.checked)}
            className="h-4 w-4"
          />
          공개
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-[15px] font-bold">구역(섹션) 구성</h2>
        <SectionsEditor
          value={form.sections}
          onChange={(next) => update("sections", next)}
        />
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
