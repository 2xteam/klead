"use client";

import { useState } from "react";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-500";

type CheckState = "idle" | "checking" | "ok" | "taken" | "invalid";

/**
 * 관리자용 슬러그 입력 + 중복확인 버튼. 모든 콘텐츠 slug 등록에 공통 사용.
 * scope: "content"(강의/큐레이터/게시글) | "menu"
 */
export function SlugField({
  value,
  onChange,
  scope = "content",
  excludeId,
  label = "슬러그 (URL, 고유)",
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  scope?: "content" | "menu";
  excludeId?: string | null;
  label?: string;
  hint?: string;
}) {
  const [state, setState] = useState<CheckState>("idle");
  const [msg, setMsg] = useState("");

  async function check() {
    const slug = value.trim();
    if (!slug) {
      setState("invalid");
      setMsg("슬러그를 입력하세요.");
      return;
    }
    setState("checking");
    setMsg("");
    try {
      const params = new URLSearchParams({ scope, slug });
      if (excludeId) params.set("exclude", excludeId);
      const res = await fetch(`/api/admin/slug-check?${params.toString()}`);
      const data = (await res.json()) as { available: boolean; error?: string };
      if (data.error) {
        setState("invalid");
        setMsg(data.error);
      } else if (data.available) {
        setState("ok");
        setMsg("사용 가능한 슬러그입니다.");
      } else {
        setState("taken");
        setMsg("이미 사용 중인 슬러그입니다.");
      }
    } catch {
      setState("invalid");
      setMsg("확인 실패");
    }
  }

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex gap-2">
        <input
          className={field}
          value={value}
          placeholder="예: kim-boryeong"
          onChange={(e) => {
            onChange(
              e.target.value.trim().toLowerCase().replace(/\s+/g, "-"),
            );
            setState("idle");
            setMsg("");
          }}
        />
        <button
          type="button"
          onClick={check}
          disabled={state === "checking"}
          className="shrink-0 rounded-md border border-black/15 px-4 py-2 text-[13px] font-semibold disabled:opacity-50"
        >
          {state === "checking" ? "확인 중…" : "중복 확인"}
        </button>
      </div>
      {(msg || hint) && (
        <p
          className={
            "mt-1 text-[12px] " +
            (state === "ok"
              ? "text-green-600"
              : state === "taken" || state === "invalid"
                ? "text-red-600"
                : "text-klead-gray-400")
          }
        >
          {msg || hint}
        </p>
      )}
    </div>
  );
}
