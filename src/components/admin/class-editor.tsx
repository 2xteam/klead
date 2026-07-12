"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { IPageSection } from "@/lib/db/models/content";
import { SectionsEditor } from "@/components/admin/sections-editor";
import { SlugField } from "@/components/admin/slug-field";
import { ImageInput, ImageListInput } from "@/components/admin/image-input";

export interface ClassFormData {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  gallery: string[];
  priceDisplay: "inquiry" | "free" | "amount";
  priceAmount: number | null;
  isPublic: boolean;
  permissionTypeId: string;
  sections: IPageSection[];
}

export interface PermissionOption {
  id: string;
  name: string;
  code: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-700";

export function ClassEditor({
  initial,
  contentId,
  permissionOptions = [],
}: {
  initial: ClassFormData;
  contentId?: string | null;
  permissionOptions?: PermissionOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<ClassFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  // 원본 slug(URL 조회용) — 이름 변경 시에도 기존 문서를 찾기 위함
  const origSlug = useRef(initial.slug).current;

  function update<K extends keyof ClassFormData>(
    key: K,
    value: ClassFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/classes/${origSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug,
          title: form.title,
          summary: form.summary,
          thumbnail: form.thumbnail,
          gallery: form.gallery,
          priceDisplay: form.priceDisplay,
          priceAmount: form.priceAmount,
          isPublic: form.isPublic,
          permissionTypeId: form.permissionTypeId,
          sections: form.sections,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setState("saved");
      setMessage("저장되었습니다.");
      if (form.slug !== origSlug) {
        router.push(`/admin/classes/${form.slug}`);
      }
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "저장 실패");
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <SlugField
          value={form.slug}
          onChange={(v) => update("slug", v)}
          scope="content"
          excludeId={contentId ?? undefined}
          hint="URL에 사용됩니다. 예: /courses/waxing-basic-01"
        />
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
          <label className={labelCls}>썸네일</label>
          <ImageInput
            value={form.thumbnail}
            onChange={(v) => update("thumbnail", v)}
            folder="courses"
          />
        </div>
        <div>
          <label className={labelCls}>상품 갤러리 이미지</label>
          <ImageListInput
            value={form.gallery}
            onChange={(v) => update("gallery", v)}
            folder="courses"
          />
          <p className="mt-1 text-[12px] text-klead-gray-400">
            비우면 썸네일 이미지가 상품 대표 이미지로 사용됩니다.
          </p>
        </div>
        <div>
          <label className={labelCls}>열람 권한 (프로그램·권한 매핑)</label>
          <select
            className={field}
            value={form.permissionTypeId}
            onChange={(e) => update("permissionTypeId", e.target.value)}
          >
            <option value="">권한 없음 (누구나 열람)</option>
            {permissionOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[12px] text-klead-gray-400">
            이 권한을 보유한(구독/부여) 회원만 강의 페이지를 열람할 수 있습니다.
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

      <section className="space-y-4">
        <h2 className="text-[15px] font-bold">구역(섹션) 구성</h2>
        <SectionsEditor
          value={form.sections}
          onChange={(sections) => update("sections", sections)}
        />
      </section>

      <div className="sticky bottom-0 flex items-center justify-end gap-4 border-t border-black/10 bg-white/90 py-4 pr-4 backdrop-blur">
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
        <button
          onClick={save}
          disabled={state === "saving"}
          className="rounded-md bg-klead-primary px-6 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "저장 중…" : "저장"}
        </button>
      </div>
    </div>
  );
}
