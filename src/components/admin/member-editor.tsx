"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface MemberPermissionView {
  id: string;
  name: string;
  code: string;
  category: string;
  source: string;
  startAt: string | null;
  endAt: string | null;
}

export interface MemberFormData {
  id: string;
  name: string;
  email: string;
  authProvider: string;
  role: "member" | "admin";
  status: "active" | "suspended" | "withdrawn";
  notificationPrefs: {
    notice: boolean;
    marketing: boolean;
    qnaReply: boolean;
  };
  permissions: MemberPermissionView[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

const PROVIDER_LABEL: Record<string, string> = {
  kakao: "카카오",
  test: "테스트",
};

const SOURCE_LABEL: Record<string, string> = {
  manual: "수동",
  subscription: "구독",
  promotion: "프로모션",
};

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-700";
const readonlyCls =
  "w-full rounded-md border border-black/10 bg-[#fafafa] px-3 py-2 text-[14px] text-klead-gray-500";

export function MemberEditor({ initial }: { initial: MemberFormData }) {
  const router = useRouter();
  const [form, setForm] = useState<MemberFormData>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof MemberFormData>(
    key: K,
    value: MemberFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("idle");
  }

  function updatePref(key: keyof MemberFormData["notificationPrefs"]) {
    setForm((f) => ({
      ...f,
      notificationPrefs: {
        ...f.notificationPrefs,
        [key]: !f.notificationPrefs[key],
      },
    }));
    setState("idle");
  }

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/members/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          status: form.status,
          notificationPrefs: form.notificationPrefs,
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
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="text-[15px] font-bold">기본 정보</h2>
        <div className="flex gap-6">
          <div className="flex-1">
            <label className={labelCls}>이름</label>
            <div className={readonlyCls}>{form.name}</div>
          </div>
          <div className="flex-1">
            <label className={labelCls}>이메일</label>
            <div className={readonlyCls}>{form.email || "-"}</div>
          </div>
        </div>
        <div>
          <label className={labelCls}>가입경로</label>
          <div className={readonlyCls}>
            {PROVIDER_LABEL[form.authProvider] ?? form.authProvider}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="text-[15px] font-bold">회원 설정</h2>
        <div className="flex gap-6">
          <div className="flex-1">
            <label className={labelCls}>권한</label>
            <select
              className={field}
              value={form.role}
              onChange={(e) =>
                update("role", e.target.value as MemberFormData["role"])
              }
            >
              <option value="member">회원</option>
              <option value="admin">관리자</option>
            </select>
          </div>
          <div className="flex-1">
            <label className={labelCls}>상태</label>
            <select
              className={field}
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as MemberFormData["status"])
              }
            >
              <option value="active">활성</option>
              <option value="suspended">정지</option>
              <option value="withdrawn">탈퇴</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>알림 수신 설정</label>
          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={form.notificationPrefs.notice}
                onChange={() => updatePref("notice")}
                className="h-4 w-4"
              />
              공지사항
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={form.notificationPrefs.marketing}
                onChange={() => updatePref("marketing")}
                className="h-4 w-4"
              />
              마케팅
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={form.notificationPrefs.qnaReply}
                onChange={() => updatePref("qnaReply")}
                className="h-4 w-4"
              />
              Q&amp;A 답변
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="text-[15px] font-bold">
          보유 권한
          <span className="ml-2 text-[12px] font-normal text-klead-gray-400">
            읽기 전용
          </span>
        </h2>
        {form.permissions.length === 0 ? (
          <p className="text-[13px] text-klead-gray-400">
            부여된 권한이 없습니다.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-black/10">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-black/10 bg-[#fafafa] text-[11px] uppercase text-klead-gray-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">권한</th>
                  <th className="px-3 py-2 font-semibold">분류</th>
                  <th className="px-3 py-2 font-semibold">출처</th>
                  <th className="px-3 py-2 font-semibold">기간</th>
                </tr>
              </thead>
              <tbody>
                {form.permissions.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="px-3 py-2 font-medium">
                      {p.name}
                      <span className="ml-2 text-[11px] text-klead-gray-400">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-klead-gray-500">
                      {p.category}
                    </td>
                    <td className="px-3 py-2 text-klead-gray-500">
                      {SOURCE_LABEL[p.source] ?? p.source}
                    </td>
                    <td className="px-3 py-2 text-klead-gray-400">
                      {p.startAt ? p.startAt.slice(0, 10) : "-"}
                      {" ~ "}
                      {p.endAt ? p.endAt.slice(0, 10) : "무기한"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-black/10 bg-white/90 py-4 backdrop-blur">
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
    </div>
  );
}
