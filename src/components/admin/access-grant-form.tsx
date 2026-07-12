"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface LectureOption {
  id: string;
  title: string;
  slug: string;
}
export interface MemberOption {
  id: string;
  name: string;
  email: string;
}

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-700";

export function AccessGrantForm({
  lectures,
  members,
}: {
  lectures: LectureOption[];
  members: MemberOption[];
}) {
  const router = useRouter();
  const [contentId, setContentId] = useState("");
  const [type, setType] = useState<"member" | "secret">("member");
  const [userId, setUserId] = useState("");
  const [key, setKey] = useState("");
  const [gateTtlHours, setGateTtlHours] = useState(24);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    setShareUrl("");
    try {
      const res = await fetch("/api/admin/lecture-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          type,
          userId: type === "member" ? userId : undefined,
          key: type === "secret" ? key : undefined,
          gateTtlHours: type === "secret" ? gateTtlHours : undefined,
          startAt: startAt || undefined,
          endAt: endAt || undefined,
          note: note || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      setShareUrl(origin + data.shareUrl);
      setMsg("열람권이 발급되었습니다.");
      if (type === "secret") setKey("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "발급 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-lg border border-black/10 bg-white p-6"
    >
      <h2 className="text-[15px] font-bold">열람권 발급</h2>

      <div>
        <label className={labelCls}>강의 선택</label>
        <select
          className={field}
          value={contentId}
          onChange={(e) => setContentId(e.target.value)}
          required
        >
          <option value="">— 강의를 선택하세요 —</option>
          {lectures.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title} (/{l.slug})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-[14px]">
          <input
            type="radio"
            checked={type === "member"}
            onChange={() => setType("member")}
          />
          회원 지정
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[14px]">
          <input
            type="radio"
            checked={type === "secret"}
            onChange={() => setType("secret")}
          />
          시크릿 키(회원번호 없이 URL 공유)
        </label>
      </div>

      {type === "member" ? (
        <div>
          <label className={labelCls}>회원 선택</label>
          <select
            className={field}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          >
            <option value="">— 회원을 선택하세요 —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {m.email}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className={labelCls}>시크릿 키 (공유용, 4자 이상)</label>
          <input
            className={field}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="예: klead-2026-vip"
            autoComplete="off"
          />
          <p className="mt-1 text-[12px] text-klead-gray-400">
            키는 해시로만 저장됩니다. 발급 후 URL과 키를 함께 전달하세요.
          </p>
          <div className="mt-3">
            <label className={labelCls}>재입력 주기 (시간)</label>
            <input
              type="number"
              min={1}
              className={field}
              value={gateTtlHours}
              onChange={(e) => setGateTtlHours(Number(e.target.value) || 24)}
            />
            <p className="mt-1 text-[12px] text-klead-gray-400">
              키 입력에 성공하면 이 시간 동안 재입력 없이 열람됩니다(브라우저
              쿠키). 종료일이 있으면 그보다 길게 유지되지 않습니다.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelCls}>시작일 (선택)</label>
          <input
            type="date"
            className={field}
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className={labelCls}>종료일 (비우면 무기한)</label>
          <input
            type="date"
            className={field}
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>메모 (선택)</label>
        <input
          className={field}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4 border-t border-black/10 pt-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-klead-primary px-6 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "발급 중…" : "열람권 발급"}
        </button>
        {msg && <span className="text-[13px] text-green-600">{msg}</span>}
        {err && <span className="text-[13px] text-red-600">{err}</span>}
      </div>

      {shareUrl && (
        <div className="rounded-md border border-klead-primary/30 bg-klead-primary/5 p-3">
          <p className="mb-1 text-[12px] font-semibold text-klead-gray-700">
            공유 URL
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              className={field}
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(shareUrl)}
              className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-[13px] font-semibold"
            >
              복사
            </button>
          </div>
          {type === "secret" && (
            <p className="mt-2 text-[12px] text-klead-gray-500">
              시크릿 키는 URL과 별도로 안전하게 전달하세요.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
