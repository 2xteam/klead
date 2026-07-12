"use client";

import type { ReactNode } from "react";
import type { SectionType } from "@/lib/db/models/content";
import { SECTION_TYPES, SECTION_TYPE_LABELS } from "@/lib/content/section-types";

/**
 * 구역(섹션) 타입 선택기 — 각 타입의 레이아웃을 스켈레톤으로 미리 보여준다.
 * 클릭하면 해당 타입 구역이 추가된다.
 */

// 스켈레톤 프리미티브
function Bar({
  w = "100%",
  h = 8,
  light = false,
  className = "",
}: {
  w?: string | number;
  h?: number;
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded ${light ? "bg-white/30" : "bg-black/15"} ${className}`}
      style={{ width: w, height: h }}
    />
  );
}
function Img({
  light = false,
  className = "",
  h,
}: {
  light?: boolean;
  className?: string;
  h?: number;
}) {
  return (
    <div
      className={`rounded ${light ? "bg-white/20" : "bg-black/10"} ${className}`}
      style={h ? { height: h } : undefined}
    />
  );
}

const frame = "flex h-[150px] w-full flex-col overflow-hidden rounded-md p-3";
const dark = `${frame} bg-neutral-800`;
const lightF = `${frame} bg-neutral-100`;

const PREVIEW: Record<SectionType, ReactNode> = {
  hero: (
    <div className={`${dark} items-center justify-center gap-2`}>
      <Bar w={40} h={5} light />
      <Bar w="60%" h={12} light />
      <Bar w="45%" h={6} light />
    </div>
  ),
  richText: (
    <div className={`${lightF} gap-2`}>
      <Bar w="45%" h={11} />
      <div className="mt-1 flex flex-col gap-1.5">
        <Bar w="100%" h={6} />
        <Bar w="95%" h={6} />
        <Bar w="80%" h={6} />
      </div>
    </div>
  ),
  image: (
    <div className={lightF}>
      <Img className="h-full w-full" />
    </div>
  ),
  imageText: (
    <div className={`${lightF} flex-row items-center gap-3`}>
      <Img className="h-full w-1/2" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Bar w="70%" h={10} />
        <Bar w="100%" h={6} />
        <Bar w="90%" h={6} />
        <Bar w="60%" h={6} />
      </div>
    </div>
  ),
  gallery: (
    <div className={lightF}>
      <div className="grid h-full grid-cols-4 grid-rows-2 gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Img key={i} className="h-full w-full" />
        ))}
      </div>
    </div>
  ),
  slider: (
    <div className={`${dark} justify-center`}>
      <div className="flex gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Img key={i} light className="h-16 w-16 shrink-0" />
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-white/40">자동 슬라이드 →</p>
    </div>
  ),
  cards: (
    <div className={`${dark} justify-center`}>
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1 rounded bg-white/10 p-1.5">
            <Bar w="60%" h={5} light />
            <Bar w="100%" h={4} light />
            <Bar w="80%" h={4} light />
          </div>
        ))}
      </div>
    </div>
  ),
  steps: (
    <div className={`${dark} justify-center`}>
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 rounded border border-white/15 p-1.5"
          >
            <div className="h-3 w-3 rounded-full bg-white/30" />
            <Bar w="70%" h={4} light />
            <Bar w="90%" h={4} light />
          </div>
        ))}
      </div>
    </div>
  ),
  profile: (
    <div className={`${dark} flex-row items-center gap-3`}>
      <Img light className="h-full w-2/5" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Bar w="80%" h={12} light />
        <Bar w="55%" h={7} light />
        <div className="mt-1 flex flex-col gap-1">
          <Bar w="90%" h={4} light />
          <Bar w="85%" h={4} light />
          <Bar w="70%" h={4} light />
        </div>
      </div>
    </div>
  ),
  profileHeader: (
    <div className={`${dark} flex-row items-end gap-3`}>
      <Img light className="h-4/5 w-1/3" />
      <div className="flex flex-1 flex-col gap-1.5 pb-2">
        <Bar w={40} h={5} light />
        <Bar w="70%" h={13} light />
        <Bar w="90%" h={5} light />
      </div>
    </div>
  ),
  splitText: (
    <div className={`${dark} flex-row gap-4`}>
      <div className="w-2/5">
        <Bar w="90%" h={12} light />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bar key={i} w={`${90 - i * 6}%`} h={5} light />
        ))}
      </div>
    </div>
  ),
  divider: (
    <div className={`${dark} items-center justify-center`}>
      <div className="h-px w-4/5 bg-white/40" />
      <p className="mt-3 text-[10px] text-white/40">가로 구분선</p>
    </div>
  ),
  linkCards: (
    <div className={`${dark} justify-center`}>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <Img light className="h-12 w-full" />
            <Bar w="70%" h={5} light />
            <div className="h-4 w-12 rounded-full bg-white/70" />
          </div>
        ))}
      </div>
    </div>
  ),
  banner: (
    <div className={`${dark} items-center justify-center gap-2`}>
      <div className="h-4 w-16 rounded-full border border-white/40" />
      <Bar w="55%" h={10} light />
      <div className="mt-1 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Img key={i} light className="h-6 w-10" />
        ))}
      </div>
    </div>
  ),
  partners: (
    <div className={`${lightF} items-center justify-center`}>
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Img key={i} className="h-8 w-12" />
        ))}
      </div>
    </div>
  ),
  contact: (
    <div className={`${dark} justify-center`}>
      <Bar w="40%" h={12} light className="mb-2" />
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1 rounded bg-white/10 p-1.5">
            <Bar w="70%" h={5} light />
            <Bar w="100%" h={4} light />
          </div>
        ))}
      </div>
    </div>
  ),
};

export function SectionTypePicker({
  onAdd,
}: {
  onAdd: (type: SectionType) => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-black/15 bg-white p-4">
      <p className="mb-3 text-[13px] font-semibold text-klead-gray-500">
        추가할 구역을 선택하세요
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTION_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onAdd(t)}
            className="group flex flex-col overflow-hidden rounded-lg border border-black/10 text-left transition hover:border-klead-primary hover:shadow-md"
          >
            {PREVIEW[t]}
            <span className="border-t border-black/10 bg-white px-3 py-2 text-[13px] font-semibold text-klead-gray-800 group-hover:text-klead-primary">
              {SECTION_TYPE_LABELS[t]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
