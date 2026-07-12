"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * 시크릿키 입력 팝업. 키 검증 성공 시 서버가 서명 쿠키를 발급하고,
 * router.refresh()로 강의 콘텐츠를 다시 로드한다.
 */
export function SecretGate({ slug, code }: { slug: string; code: string }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [fails, setFails] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/lecture-access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, code, key }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const next = fails + 1;
      setFails(next);
      setErr("시크릿 키가 올바르지 않습니다.");
      setBusy(false);
      if (next >= 5) {
        // 반복 실패 시 강의 종목으로 이동(무차별 대입 방지)
        router.replace("/courses");
      }
    } catch {
      setErr("확인 중 오류가 발생했습니다.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#0e0e0e] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="4" y="10" width="16" height="10" rx="2" stroke="white" strokeWidth="1.6" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="white" strokeWidth="1.6" />
          </svg>
        </div>
        <h1 className="text-[18px] font-bold text-white">시크릿 열람</h1>
        <p className="mt-2 text-[13px] text-white/60">
          공유받은 시크릿 키를 입력하면 강의를 열람할 수 있습니다.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="시크릿 키"
          autoComplete="off"
          className="mt-5 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:border-klead-primary focus:outline-none"
        />
        {err && <p className="mt-2 text-[13px] text-red-400">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-full bg-white px-6 py-2.5 text-[14px] font-bold text-black transition hover:bg-white/90 disabled:opacity-50"
        >
          {busy ? "확인 중…" : "열람하기"}
        </button>
      </form>
    </div>
  );
}
