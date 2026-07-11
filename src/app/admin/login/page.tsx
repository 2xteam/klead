"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin/classes";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "로그인 실패");
      }
      router.replace(from.startsWith("/admin") ? from : "/admin/classes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm"
    >
      <div className="mb-6 text-center">
        <p className="text-[20px] font-bold">
          KLEAD <span className="text-klead-primary">Admin</span>
        </p>
        <p className="mt-1 text-[13px] text-klead-gray-500">
          관리자 비밀번호를 입력하세요
        </p>
      </div>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        className="mb-3 w-full rounded-md border border-black/15 px-3 py-2.5 text-[15px] focus:border-klead-primary focus:outline-none"
      />
      {error && <p className="mb-3 text-[13px] text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full rounded-md bg-klead-primary py-2.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f4f5] px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
