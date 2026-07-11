"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ContentCategory =
  | "notice"
  | "resource"
  | "event"
  | "guide"
  | "community";

export type PublishStatus = "draft" | "scheduled" | "published" | "expired";

export interface PostFormData {
  _id: string | null;
  title: string;
  slug: string;
  contentCategory: ContentCategory;
  summary: string;
  body: string;
  thumbnail: string;
  isPinned: boolean;
  isPublic: boolean;
  publishStatus: PublishStatus;
}

type SaveState = "idle" | "saving" | "deleting" | "saved" | "error";

const CATEGORY_OPTIONS: { value: ContentCategory; label: string }[] = [
  { value: "notice", label: "공지사항" },
  { value: "resource", label: "자료실" },
  { value: "event", label: "이벤트" },
  { value: "guide", label: "가이드" },
  { value: "community", label: "커뮤니티" },
];

const STATUS_OPTIONS: { value: PublishStatus; label: string }[] = [
  { value: "draft", label: "임시저장" },
  { value: "scheduled", label: "예약" },
  { value: "published", label: "게시됨" },
  { value: "expired", label: "만료" },
];

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-700";

export function PostEditor({ initial }: { initial: PostFormData }) {
  const router = useRouter();
  const [form, setForm] = useState<PostFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const isNew = form._id === null;

  function update<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  async function save() {
    if (!form.title.trim()) {
      setState("error");
      setMessage("제목을 입력하세요.");
      return;
    }
    setState("saving");
    setMessage("");
    const payload = {
      title: form.title,
      slug: form.slug,
      contentCategory: form.contentCategory,
      summary: form.summary,
      body: form.body,
      thumbnail: form.thumbnail,
      isPinned: form.isPinned,
      isPublic: form.isPublic,
      publishStatus: form.publishStatus,
    };
    try {
      const res = await fetch(
        isNew ? "/api/admin/posts" : `/api/admin/posts/${form._id}`,
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
      const data = (await res.json()) as { _id?: string };
      setState("saved");
      setMessage("저장되었습니다.");
      if (isNew && data._id) {
        router.push(`/admin/posts/${data._id}`);
      } else {
        router.refresh();
      }
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "저장 실패");
    }
  }

  async function remove() {
    if (isNew) return;
    if (!confirm("이 게시글을 삭제하시겠습니까?")) return;
    setState("deleting");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/posts/${form._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.push("/admin/posts");
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
          <label className={labelCls}>슬러그 (비우면 자동 생성)</label>
          <input
            className={field}
            value={form.slug}
            placeholder="my-post-slug"
            onChange={(e) => update("slug", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>분류</label>
          <select
            className={field}
            value={form.contentCategory}
            onChange={(e) =>
              update("contentCategory", e.target.value as ContentCategory)
            }
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
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
          <label className={labelCls}>본문 (HTML 허용)</label>
          <textarea
            className={`${field} font-mono`}
            rows={12}
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
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
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[180px]">
            <label className={labelCls}>게시 상태</label>
            <select
              className={field}
              value={form.publishStatus}
              onChange={(e) =>
                update("publishStatus", e.target.value as PublishStatus)
              }
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 py-2 text-[14px]">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => update("isPublic", e.target.checked)}
              className="h-4 w-4"
            />
            공개
          </label>
          <label className="flex cursor-pointer items-center gap-2 py-2 text-[14px]">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => update("isPinned", e.target.checked)}
              className="h-4 w-4"
            />
            상단 고정
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-black/10 bg-white/90 py-4 backdrop-blur">
        <button
          onClick={save}
          disabled={state === "saving" || state === "deleting"}
          className="rounded-md bg-klead-primary px-6 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "저장 중…" : "저장"}
        </button>
        {!isNew && (
          <button
            onClick={remove}
            disabled={state === "saving" || state === "deleting"}
            className="rounded-md border border-red-200 px-4 py-2 text-[14px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {state === "deleting" ? "삭제 중…" : "삭제"}
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
