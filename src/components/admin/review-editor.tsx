"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ReviewFormData {
  id: string;
  rating: number;
  title: string;
  body: string;
  isVisible: boolean;
  isFeatured: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-700";

export function ReviewEditor({ initial }: { initial: ReviewFormData }) {
  const router = useRouter();
  const [rating, setRating] = useState(initial.rating);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [isVisible, setIsVisible] = useState(initial.isVisible);
  const [isFeatured, setIsFeatured] = useState(initial.isFeatured);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reviews/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title,
          body,
          isVisible,
          isFeatured,
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

  async function remove() {
    if (!window.confirm("이 리뷰를 삭제하시겠습니까?")) return;
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reviews/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.push("/admin/reviews");
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "삭제 실패");
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
      <div>
        <label className={labelCls}>평점</label>
        <select
          className={field}
          value={rating}
          onChange={(e) => {
            setRating(Number(e.target.value));
            setState("idle");
          }}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n}점)
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>제목</label>
        <input
          className={field}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setState("idle");
          }}
          placeholder="제목을 입력하세요."
        />
      </div>
      <div>
        <label className={labelCls}>내용</label>
        <textarea
          className={field}
          rows={8}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setState("idle");
          }}
          placeholder="리뷰 내용을 입력하세요."
        />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-[14px] text-klead-gray-700">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => {
              setIsVisible(e.target.checked);
              setState("idle");
            }}
          />
          노출
        </label>
        <label className="flex items-center gap-2 text-[14px] text-klead-gray-700">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => {
              setIsFeatured(e.target.checked);
              setState("idle");
            }}
          />
          추천
        </label>
      </div>
      <div className="flex items-center gap-4 border-t border-black/10 pt-4">
        <button
          onClick={save}
          disabled={state === "saving"}
          className="rounded-md bg-klead-primary px-6 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "저장 중…" : "저장"}
        </button>
        <button
          onClick={remove}
          disabled={state === "saving"}
          className="rounded-md border border-red-300 px-6 py-2 text-[14px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          삭제
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
    </section>
  );
}
