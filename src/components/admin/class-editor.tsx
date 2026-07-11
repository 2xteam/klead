"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IPageSection } from "@/lib/db/models/content";

export interface ClassFormData {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  gallery: string[];
  priceDisplay: "inquiry" | "free" | "amount";
  priceAmount: number | null;
  isPublic: boolean;
  sections: IPageSection[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-700";

export function ClassEditor({ initial }: { initial: ClassFormData }) {
  const router = useRouter();
  const [form, setForm] = useState<ClassFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof ClassFormData>(
    key: K,
    value: ClassFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  function updateItem(
    sIdx: number,
    iIdx: number,
    key: "title" | "subtitle" | "description",
    value: string,
  ) {
    setForm((f) => {
      const sections = structuredClone(f.sections);
      const items = sections[sIdx].items;
      if (items?.[iIdx]) items[iIdx][key] = value;
      return { ...f, sections };
    });
    setState("idle");
  }

  function updateBullets(sIdx: number, iIdx: number, value: string) {
    setForm((f) => {
      const sections = structuredClone(f.sections);
      const items = sections[sIdx].items;
      if (items?.[iIdx])
        items[iIdx].bullets = value
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      return { ...f, sections };
    });
    setState("idle");
  }

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/classes/${form.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          thumbnail: form.thumbnail,
          gallery: form.gallery,
          priceDisplay: form.priceDisplay,
          priceAmount: form.priceAmount,
          isPublic: form.isPublic,
          sections: form.sections,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setState("saved");
      setMessage("저장되었습니다.");
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "저장 실패");
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
          <label className={labelCls}>요약</label>
          <textarea
            className={field}
            rows={3}
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
        <div>
          <label className={labelCls}>상품 갤러리 이미지 URL (줄바꿈으로 여러 개)</label>
          <textarea
            className={field}
            rows={3}
            value={form.gallery.join("\n")}
            onChange={(e) =>
              update(
                "gallery",
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
          <p className="mt-1 text-[12px] text-klead-gray-400">
            비우면 썸네일 이미지가 상품 대표 이미지로 사용됩니다.
          </p>
        </div>
        <div className="flex gap-6">
          <div className="flex-1">
            <label className={labelCls}>가격 표시</label>
            <select
              className={field}
              value={form.priceDisplay}
              onChange={(e) =>
                update(
                  "priceDisplay",
                  e.target.value as ClassFormData["priceDisplay"],
                )
              }
            >
              <option value="inquiry">가격문의</option>
              <option value="free">무료</option>
              <option value="amount">유료</option>
            </select>
          </div>
          {form.priceDisplay === "amount" && (
            <div className="flex-1">
              <label className={labelCls}>가격 (원)</label>
              <input
                type="number"
                className={field}
                value={form.priceAmount ?? ""}
                onChange={(e) =>
                  update(
                    "priceAmount",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </div>
          )}
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => update("isPublic", e.target.checked)}
                className="h-4 w-4"
              />
              공개
            </label>
          </div>
        </div>
      </section>

      {form.sections.map((section, sIdx) => (
        <section
          key={section.key}
          className="space-y-4 rounded-lg border border-black/10 bg-white p-6"
        >
          <h2 className="text-[15px] font-bold">
            섹션: {section.title ?? section.key}
            <span className="ml-2 text-[12px] font-normal text-klead-gray-400">
              {section.key}
            </span>
          </h2>
          {section.items?.map((item, iIdx) => (
            <div
              key={iIdx}
              className="space-y-2 rounded-md border border-black/10 bg-[#fafafa] p-4"
            >
              <input
                className={field}
                placeholder="제목"
                value={item.title ?? ""}
                onChange={(e) =>
                  updateItem(sIdx, iIdx, "title", e.target.value)
                }
              />
              {"subtitle" in item && (
                <input
                  className={field}
                  placeholder="부제"
                  value={item.subtitle ?? ""}
                  onChange={(e) =>
                    updateItem(sIdx, iIdx, "subtitle", e.target.value)
                  }
                />
              )}
              <textarea
                className={field}
                rows={2}
                placeholder="설명"
                value={item.description ?? ""}
                onChange={(e) =>
                  updateItem(sIdx, iIdx, "description", e.target.value)
                }
              />
              {item.bullets && item.bullets.length > 0 && (
                <textarea
                  className={field}
                  rows={item.bullets.length + 1}
                  placeholder="세부 항목 (줄바꿈 구분)"
                  value={item.bullets.join("\n")}
                  onChange={(e) => updateBullets(sIdx, iIdx, e.target.value)}
                />
              )}
            </div>
          ))}
        </section>
      ))}

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-black/10 bg-white/90 py-4 backdrop-blur">
        <button
          onClick={save}
          disabled={state === "saving"}
          className="rounded-md bg-klead-primary px-6 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "저장 중…" : "저장"}
        </button>
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
