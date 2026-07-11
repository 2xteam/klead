"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type SettingGroup =
  | "general"
  | "header"
  | "footer"
  | "sns"
  | "seo"
  | "company";

export interface SettingDTO {
  _id: string;
  key: string;
  /** 문자열이면 그대로, 객체면 JSON 문자열. admin_password는 마스킹된 값. */
  value: string;
  group: SettingGroup;
  description: string;
  updatedAt: string | null;
  masked: boolean;
}

const GROUPS: { value: SettingGroup; label: string }[] = [
  { value: "general", label: "일반" },
  { value: "header", label: "헤더" },
  { value: "footer", label: "푸터" },
  { value: "sns", label: "SNS" },
  { value: "seo", label: "SEO" },
  { value: "company", label: "회사정보" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-500";

function SettingCard({ initial }: { initial: SettingDTO }) {
  const router = useRouter();
  const [value, setValue] = useState(initial.value);
  const [group, setGroup] = useState<SettingGroup>(initial.group);
  const [description, setDescription] = useState(initial.description);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/settings/${initial.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, group, description }),
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
    if (!window.confirm(`"${initial.key}" 설정을 삭제하시겠습니까?`)) return;
    setState("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/settings/${initial.key}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "삭제 실패");
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-[14px] font-semibold">
            {initial.key}
          </span>
          {initial.updatedAt && (
            <span className="ml-2 text-[12px] text-klead-gray-500">
              {initial.updatedAt.slice(0, 10)}
            </span>
          )}
        </div>
      </div>

      {initial.masked && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
          주의: 이 값은 관리자 비밀번호입니다. 값을 변경하면 즉시 적용되며,
          비워 두거나 마스킹(********) 상태로 저장하면 기존 값이 유지됩니다.
        </p>
      )}

      <div>
        <label className={labelCls}>값</label>
        <textarea
          className={`${field} font-mono`}
          rows={value.includes("\n") ? Math.min(value.split("\n").length + 1, 12) : 2}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setState("idle");
          }}
        />
      </div>

      <div className="flex gap-4">
        <div className="w-40">
          <label className={labelCls}>그룹</label>
          <select
            className={field}
            value={group}
            onChange={(e) => {
              setGroup(e.target.value as SettingGroup);
              setState("idle");
            }}
          >
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className={labelCls}>설명</label>
          <input
            className={field}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setState("idle");
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={state === "saving"}
          className="rounded-md bg-klead-primary px-4 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "저장 중…" : "저장"}
        </button>
        <button
          onClick={remove}
          disabled={state === "saving"}
          className="rounded-md border border-black/15 px-4 py-1.5 text-[13px] font-medium text-klead-gray-500 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
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
    </div>
  );
}

function NewSettingForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [group, setGroup] = useState<SettingGroup>("general");
  const [value, setValue] = useState("");
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  async function create() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, group, value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setKey("");
      setValue("");
      setGroup("general");
      setState("saved");
      setMessage("추가되었습니다.");
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "추가 실패");
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-black/10 bg-white p-6">
      <h2 className="text-[15px] font-bold">새 설정 추가</h2>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelCls}>키 (고유)</label>
          <input
            className={`${field} font-mono`}
            placeholder="예: header_logo"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setState("idle");
            }}
          />
        </div>
        <div className="w-40">
          <label className={labelCls}>그룹</label>
          <select
            className={field}
            value={group}
            onChange={(e) => setGroup(e.target.value as SettingGroup)}
          >
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>값 (문자열 또는 JSON)</label>
        <textarea
          className={`${field} font-mono`}
          rows={2}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setState("idle");
          }}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={create}
          disabled={state === "saving" || key.trim() === ""}
          className="rounded-md bg-klead-primary px-4 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "추가 중…" : "추가"}
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

export function SettingsManager({ settings }: { settings: SettingDTO[] }) {
  return (
    <div className="space-y-8">
      <NewSettingForm />

      {GROUPS.map((g) => {
        const items = settings.filter((s) => s.group === g.value);
        if (items.length === 0) return null;
        return (
          <section key={g.value} className="space-y-3">
            <h2 className="text-[15px] font-bold">
              {g.label}
              <span className="ml-2 text-[12px] font-normal text-klead-gray-500">
                {items.length}개
              </span>
            </h2>
            <div className="space-y-3">
              {items.map((s) => (
                <SettingCard key={s._id} initial={s} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
