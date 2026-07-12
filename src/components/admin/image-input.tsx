"use client";

import { useRef, useState } from "react";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";

async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.url as string;
}

/** URL 직접 입력 + 파일 업로드(R2) 겸용 단일 이미지 입력 */
export function ImageInput({
  value,
  onChange,
  folder = "content",
  placeholder = "이미지 URL 또는 업로드",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadFile(file, folder));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          className={field}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-[13px] font-semibold disabled:opacity-50"
        >
          {busy ? "업로드…" : "업로드"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {err && <p className="text-[12px] text-red-600">{err}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-16 w-auto rounded border border-black/10 object-cover"
        />
      )}
    </div>
  );
}

/** 다중 이미지(갤러리) — 업로드/URL 추가, 순서 이동, 삭제 */
export function ImageListInput({
  value,
  onChange,
  folder = "gallery",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [url, setUrl] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    setErr("");
    try {
      const uploaded: string[] = [];
      for (const f of Array.from(files)) uploaded.push(await uploadFile(f, folder));
      onChange([...value, ...uploaded]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(i: number, dir: -1 | 1) {
    const t = i + dir;
    if (t < 0 || t >= value.length) return;
    const next = [...value];
    [next[i], next[t]] = [next[t], next[i]];
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-klead-gray-500">
          이미지 목록 ({value.length})
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-klead-primary px-3 py-1 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {busy ? "업로드…" : "+ 이미지 업로드"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {err && <p className="text-[12px] text-red-600">{err}</p>}
      <div className="flex gap-2">
        <input
          className={field}
          placeholder="URL로 추가"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            if (url.trim()) {
              onChange([...value, url.trim()]);
              setUrl("");
            }
          }}
          className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-[13px] font-semibold"
        >
          추가
        </button>
      </div>
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((src, i) => (
            <li
              key={i}
              className="relative overflow-hidden rounded border border-black/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-24 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-1.5 py-1 text-white">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-[13px] disabled:opacity-30"
                  title="앞으로"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-[12px] font-semibold text-red-300"
                >
                  삭제
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  className="text-[13px] disabled:opacity-30"
                  title="뒤로"
                >
                  →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
