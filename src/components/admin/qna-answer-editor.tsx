"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface QnAAnswerFormData {
  id: string;
  status: "pending" | "answered" | "closed";
  answerBody: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-700";

export function QnAAnswerEditor({ initial }: { initial: QnAAnswerFormData }) {
  const router = useRouter();
  const [status, setStatus] = useState<QnAAnswerFormData["status"]>(
    initial.status,
  );
  const [answerBody, setAnswerBody] = useState(initial.answerBody);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/qna/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          answer: { body: answerBody },
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
    <section className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
      <div>
        <label className={labelCls}>답변 내용</label>
        <textarea
          className={field}
          rows={8}
          value={answerBody}
          onChange={(e) => {
            setAnswerBody(e.target.value);
            setState("idle");
          }}
          placeholder="답변을 입력하세요."
        />
      </div>
      <div>
        <label className={labelCls}>상태</label>
        <select
          className={field}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as QnAAnswerFormData["status"]);
            setState("idle");
          }}
        >
          <option value="pending">대기</option>
          <option value="answered">답변완료</option>
          <option value="closed">종료</option>
        </select>
      </div>
      <div className="flex items-center gap-4 border-t border-black/10 pt-4">
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
    </section>
  );
}
