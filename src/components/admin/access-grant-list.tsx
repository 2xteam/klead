"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";

export interface AccessGrantItem {
  _id: string;
  lectureTitle: string;
  lectureSlug: string;
  userName: string | null;
  source: string;
  code: string;
  hasSecret: boolean;
  secretKey: string | null;
  gateTtlHours: number;
  startAt: string | null;
  endAt: string | null;
  note: string;
  isActive: boolean;
}

const SOURCE_LABEL: Record<string, string> = {
  purchase: "구매",
  manual: "회원부여",
  secret: "시크릿키",
};

function fmt(d: string | null) {
  return d ? d.slice(0, 10) : "-";
}

const inputCls =
  "rounded-md border border-black/15 px-2.5 py-1.5 text-[13px] focus:border-klead-primary focus:outline-none";

export function AccessGrantList({ items }: { items: AccessGrantItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [ed, setEd] = useState({
    startAt: "",
    endAt: "",
    key: "",
    note: "",
    gateTtlHours: 24,
  });

  function startEdit(g: AccessGrantItem) {
    setEditId(g._id);
    setEd({
      startAt: g.startAt ? g.startAt.slice(0, 10) : "",
      endAt: g.endAt ? g.endAt.slice(0, 10) : "",
      key: "",
      note: g.note ?? "",
      gateTtlHours: g.gateTtlHours || 24,
    });
  }

  async function saveEdit(g: AccessGrantItem) {
    setBusy(g._id);
    await fetch(`/api/admin/lecture-access/${g._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startAt: ed.startAt,
        endAt: ed.endAt,
        note: ed.note,
        ...(g.hasSecret ? { gateTtlHours: ed.gateTtlHours } : {}),
        ...(g.hasSecret && ed.key.trim() ? { key: ed.key.trim() } : {}),
      }),
    });
    setBusy(null);
    setEditId(null);
    router.refresh();
  }

  async function toggle(id: string, isActive: boolean) {
    setBusy(id);
    await fetch(`/api/admin/lecture-access/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("이 열람권을 삭제하시겠습니까?")) return;
    setBusy(id);
    await fetch(`/api/admin/lecture-access/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
      <table className="w-full text-left text-[14px]">
        <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
          <tr>
            <th className="px-4 py-3 font-semibold">강의</th>
            <th className="px-4 py-3 font-semibold">유형</th>
            <th className="px-4 py-3 font-semibold">대상</th>
            <th className="px-4 py-3 font-semibold">기간</th>
            <th className="px-4 py-3 font-semibold">활성</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-klead-gray-400">
                발급된 열람권이 없습니다.
              </td>
            </tr>
          ) : (
            items.map((g) => (
              <Fragment key={g._id}>
              <tr className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]">
                <td className="px-4 py-3">
                  <span className="font-medium">{g.lectureTitle}</span>
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {SOURCE_LABEL[g.source] ?? g.source}
                </td>
                <td className="px-4 py-3 text-klead-gray-500">
                  {g.userName ? (
                    g.userName
                  ) : g.hasSecret ? (
                    <span className="inline-flex items-center gap-1.5">
                      🔑
                      {g.secretKey ? (
                        <code className="rounded bg-black/5 px-1.5 py-0.5 text-[12px] text-klead-gray-800">
                          {g.secretKey}
                        </code>
                      ) : (
                        <span className="text-[12px] text-klead-gray-400">
                          (이전 발급분 — 키 표시 불가)
                        </span>
                      )}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-[12px] text-klead-gray-500">
                  {g.endAt ? `${fmt(g.startAt)} ~ ${fmt(g.endAt)}` : "무기한"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      g.isActive
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-[12px] font-medium text-green-700"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500"
                    }
                  >
                    {g.isActive ? "활성" : "중지"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() =>
                        editId === g._id ? setEditId(null) : startEdit(g)
                      }
                      className="text-[13px] font-medium text-klead-gray-700 hover:underline"
                    >
                      {editId === g._id ? "닫기" : "수정"}
                    </button>
                    <button
                      onClick={() => toggle(g._id, g.isActive)}
                      disabled={busy === g._id}
                      className="text-[13px] font-medium text-klead-primary hover:underline disabled:opacity-40"
                    >
                      {g.isActive ? "중지" : "활성화"}
                    </button>
                    {g.lectureSlug && (
                      <a
                        href={
                          g.hasSecret
                            ? `/lecture/${g.lectureSlug}?access=${g.code}`
                            : `/lecture/${g.lectureSlug}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] font-medium text-klead-gray-500 hover:underline"
                      >
                        링크
                      </a>
                    )}
                    <button
                      onClick={() => remove(g._id)}
                      disabled={busy === g._id}
                      className="text-[13px] font-medium text-red-600 hover:underline disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
              {editId === g._id && (
                <tr className="border-b border-black/5 bg-[#fafafa]">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="text-[12px] text-klead-gray-500">
                        시작일
                        <input
                          type="date"
                          className={`${inputCls} mt-1 block`}
                          value={ed.startAt}
                          onChange={(e) =>
                            setEd((s) => ({ ...s, startAt: e.target.value }))
                          }
                        />
                      </label>
                      <label className="text-[12px] text-klead-gray-500">
                        종료일 (비우면 무기한)
                        <input
                          type="date"
                          className={`${inputCls} mt-1 block`}
                          value={ed.endAt}
                          onChange={(e) =>
                            setEd((s) => ({ ...s, endAt: e.target.value }))
                          }
                        />
                      </label>
                      {g.hasSecret && (
                        <label className="text-[12px] text-klead-gray-500">
                          시크릿 키 변경 (비우면 유지)
                          <input
                            className={`${inputCls} mt-1 block`}
                            placeholder="새 시크릿 키"
                            autoComplete="off"
                            value={ed.key}
                            onChange={(e) =>
                              setEd((s) => ({ ...s, key: e.target.value }))
                            }
                          />
                        </label>
                      )}
                      {g.hasSecret && (
                        <label className="text-[12px] text-klead-gray-500">
                          재입력 주기(시간)
                          <input
                            type="number"
                            min={1}
                            className={`${inputCls} mt-1 block w-28`}
                            value={ed.gateTtlHours}
                            onChange={(e) =>
                              setEd((s) => ({
                                ...s,
                                gateTtlHours: Number(e.target.value) || 24,
                              }))
                            }
                          />
                        </label>
                      )}
                      <label className="flex-1 text-[12px] text-klead-gray-500">
                        메모
                        <input
                          className={`${inputCls} mt-1 block w-full`}
                          value={ed.note}
                          onChange={(e) =>
                            setEd((s) => ({ ...s, note: e.target.value }))
                          }
                        />
                      </label>
                      <button
                        onClick={() => saveEdit(g)}
                        disabled={busy === g._id}
                        className="rounded-md bg-klead-primary px-5 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
                      >
                        저장
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              </Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
