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

const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-700";
const readBox =
  "w-full rounded-md border border-black/10 bg-[#fafafa] px-3 py-2 text-[14px] text-klead-gray-700";

export function ReviewEditor({ initial }: { initial: ReviewFormData }) {
  const router = useRouter();
  // 별점·제목·내용은 구매자가 작성 → 관리자 수정 불가(읽기전용)
  const [isVisible, setIsVisible] = useState(initial.isVisible);
  const [isFeatured, setIsFeatured] = useState(initial.isFeatured);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  async function persist(next: { isVisible: boolean; isFeatured: boolean }) {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reviews/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
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

  function save() {
    persist({ isVisible, isFeatured });
  }

  function hide() {
    setIsVisible(false);
    persist({ isVisible: false, isFeatured });
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
      <p className="rounded-md bg-klead-primary/5 px-3 py-2 text-[12px] text-klead-gray-500">
        별점·제목·내용은 구매자가 작성한 내용으로 수정할 수 없습니다. 노출·추천
        상태만 관리합니다.
      </p>
      <div>
        <label className={labelCls}>평점</label>
        <div className={readBox}>
          <span className="text-[15px] text-klead-primary">
            {"★".repeat(initial.rating)}
            <span className="text-black/20">
              {"★".repeat(5 - initial.rating)}
            </span>
          </span>
          <span className="ml-2 text-klead-gray-400">
            ({initial.rating}점)
          </span>
        </div>
      </div>
      <div>
        <label className={labelCls}>제목</label>
        <div className={readBox}>{initial.title || "-"}</div>
      </div>
      <div>
        <label className={labelCls}>내용</label>
        <div className={`${readBox} min-h-[120px] whitespace-pre-wrap`}>
          {initial.body || "-"}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-[14px] text-klead-gray-700">
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
        <label className="flex cursor-pointer items-center gap-2 text-[14px] text-klead-gray-700">
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
      <div className="flex items-center gap-3 border-t border-black/10 pt-4">
        <button
          onClick={save}
          disabled={state === "saving"}
          className="rounded-md bg-klead-primary px-6 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "저장 중…" : "저장"}
        </button>
        <button
          onClick={hide}
          disabled={state === "saving" || !isVisible}
          className="rounded-md border border-black/15 px-6 py-2 text-[14px] font-semibold text-klead-gray-700 transition-colors hover:bg-black/5 disabled:opacity-40"
        >
          숨김
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
