"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageInput, ImageListInput } from "@/components/admin/image-input";

export interface BannerFormData {
  name: string;
  subtitle: string;
  title: string;
  backgroundImage: string;
  logos: string[];
  isActive: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-500";

export function BannerEditor({
  id,
  initial,
}: {
  id: string | null;
  initial: BannerFormData;
}) {
  const router = useRouter();
  const isNew = id === null;
  const [form, setForm] = useState<BannerFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof BannerFormData>(
    key: K,
    value: BannerFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(
        isNew ? "/api/admin/banners" : `/api/admin/banners/${id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
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
        router.push(`/admin/banners/${data._id}`);
      }
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "저장 실패");
    }
  }

  async function remove() {
    if (isNew) return;
    if (!confirm("이 배너를 삭제하시겠습니까?")) return;
    setState("saving");
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.push("/admin/banners");
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
          <label className={labelCls}>배너 이름 (관리용)</label>
          <input
            className={field}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="예: 파트너사 배너"
          />
        </div>
        <div>
          <label className={labelCls}>상단 라벨 (부제)</label>
          <input
            className={field}
            value={form.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
            placeholder="예: 파트너사 현황"
          />
        </div>
        <div>
          <label className={labelCls}>제목</label>
          <input
            className={field}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="예: 클리드와 함께하는 파트너들"
          />
        </div>
        <div>
          <label className={labelCls}>배경 이미지</label>
          <ImageInput
            value={form.backgroundImage}
            onChange={(v) => update("backgroundImage", v)}
            folder="banner"
          />
        </div>
        <div>
          <label className={labelCls}>로고 이미지</label>
          <ImageListInput
            folder="banner"
            value={form.logos}
            onChange={(v) => update("logos", v)}
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
