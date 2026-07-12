"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface DemoMember {
  id: string;
  name: string;
  role: string;
  status: string;
  description: string;
}

export function LoginDemo({ members }: { members: DemoMember[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function login(id: string) {
    setLoading(id);
    try {
      const res = await fetch("/api/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) throw new Error("로그인 실패");
      router.push("/");
      router.refresh();
    } catch {
      setLoading(null);
    }
  }

  if (!members.length) {
    return (
      <p className="py-16 text-center text-[15px] text-klead-gray-400">
        등록된 테스트 회원이 없습니다. (npm run seed)
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {members.map((m) => (
        <li
          key={m.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-black/10 bg-white p-5"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-bold">{m.name}</span>
              <span
                className={
                  m.role === "admin"
                    ? "rounded-full bg-klead-primary/10 px-2 py-0.5 text-[11px] font-medium text-klead-primary"
                    : "rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium text-klead-gray-500"
                }
              >
                {m.role === "admin" ? "관리자" : "회원"}
              </span>
            </div>
            <p className="mt-1 truncate text-[13px] text-klead-gray-500">
              {m.description}
            </p>
          </div>
          <button
            onClick={() => login(m.id)}
            disabled={loading !== null}
            className="shrink-0 rounded-full bg-black px-5 py-2.5 text-[13px] font-semibold text-white transition-transform hover:scale-105 disabled:opacity-50"
          >
            {loading === m.id ? "로그인 중…" : "로그인"}
          </button>
        </li>
      ))}
    </ul>
  );
}
