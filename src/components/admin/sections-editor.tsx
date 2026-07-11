"use client";

import { useState } from "react";
import type {
  IPageSection,
  IPageSectionItem,
  SectionType,
} from "@/lib/db/models/content";
import { SECTION_TYPES } from "@/lib/content/section-types";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-500";

const TYPE_LABEL: Record<SectionType, string> = {
  hero: "히어로",
  richText: "리치 텍스트",
  image: "이미지",
  imageText: "이미지+텍스트",
  gallery: "갤러리",
  cards: "카드",
  steps: "단계",
  profileHeader: "프로필 헤더",
  partners: "파트너",
  contact: "연락처",
};

/** 이미지 관련 필드(imageUrl/backgroundImage/imagePosition)를 쓰는 타입 */
const IMAGE_TYPES: SectionType[] = ["hero", "image", "imageText", "profileHeader"];
/** items 배열을 쓰는 타입 */
const ITEM_TYPES: SectionType[] = [
  "cards",
  "steps",
  "gallery",
  "partners",
  "contact",
  "imageText",
];

function isImageType(t: SectionType) {
  return IMAGE_TYPES.includes(t);
}
function isItemType(t: SectionType) {
  return ITEM_TYPES.includes(t);
}

function emptyItem(sortOrder: number): IPageSectionItem {
  return {
    title: "",
    description: "",
    imageUrl: "",
    iconUrl: "",
    linkUrl: "",
    linkLabel: "",
    bullets: [],
    sortOrder,
  };
}

function emptySection(type: SectionType, index: number): IPageSection {
  return {
    key: `${type}-${index}`,
    type,
    title: "",
    subtitle: "",
    body: "",
    imageUrl: "",
    backgroundImage: "",
    theme: "light",
    imagePosition: "left",
    lazy: false,
    items: isItemType(type) ? [] : undefined,
    sortOrder: index,
  };
}

/** sortOrder를 배열 인덱스로 재계산 */
function resequence(sections: IPageSection[]): IPageSection[] {
  return sections.map((s, i) => ({ ...s, sortOrder: i }));
}

export function SectionsEditor({
  value,
  onChange,
}: {
  value: IPageSection[];
  onChange: (next: IPageSection[]) => void;
}) {
  const [addType, setAddType] = useState<SectionType>("richText");

  function mutate(fn: (draft: IPageSection[]) => void) {
    const draft = structuredClone(value);
    fn(draft);
    onChange(resequence(draft));
  }

  function addSection() {
    mutate((d) => {
      d.push(emptySection(addType, d.length));
    });
  }

  function removeSection(idx: number) {
    mutate((d) => {
      d.splice(idx, 1);
    });
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    mutate((d) => {
      const [item] = d.splice(idx, 1);
      d.splice(target, 0, item);
    });
  }

  function updateField<K extends keyof IPageSection>(
    idx: number,
    key: K,
    val: IPageSection[K],
  ) {
    mutate((d) => {
      d[idx][key] = val;
    });
  }

  function addItem(sIdx: number) {
    mutate((d) => {
      const items = d[sIdx].items ?? [];
      items.push(emptyItem(items.length));
      d[sIdx].items = items;
    });
  }

  function removeItem(sIdx: number, iIdx: number) {
    mutate((d) => {
      d[sIdx].items?.splice(iIdx, 1);
      d[sIdx].items?.forEach((it, i) => {
        it.sortOrder = i;
      });
    });
  }

  function updateItemField<K extends keyof IPageSectionItem>(
    sIdx: number,
    iIdx: number,
    key: K,
    val: IPageSectionItem[K],
  ) {
    mutate((d) => {
      const it = d[sIdx].items?.[iIdx];
      if (it) it[key] = val;
    });
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <p className="rounded-md border border-dashed border-black/15 bg-[#fafafa] p-6 text-center text-[13px] text-klead-gray-500">
          아직 구역이 없습니다. 아래에서 구역을 추가하세요.
        </p>
      )}

      {value.map((section, sIdx) => {
        const type = (section.type ?? "richText") as SectionType;
        return (
          <div
            key={sIdx}
            className="space-y-4 rounded-lg border border-black/10 bg-white p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-klead-primary/10 px-2.5 py-0.5 text-[12px] font-semibold text-klead-primary">
                  {TYPE_LABEL[type]}
                </span>
                <span className="text-[12px] text-klead-gray-400">
                  {section.key}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(sIdx, -1)}
                  disabled={sIdx === 0}
                  className="rounded-md border border-black/15 px-2 py-1 text-[13px] disabled:opacity-30"
                  title="위로"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(sIdx, 1)}
                  disabled={sIdx === value.length - 1}
                  className="rounded-md border border-black/15 px-2 py-1 text-[13px] disabled:opacity-30"
                  title="아래로"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(sIdx)}
                  className="rounded-md border border-black/15 px-2 py-1 text-[13px] font-semibold text-red-600"
                  title="삭제"
                >
                  삭제
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="w-40">
                <label className={labelCls}>테마</label>
                <select
                  className={field}
                  value={section.theme ?? "light"}
                  onChange={(e) =>
                    updateField(
                      sIdx,
                      "theme",
                      e.target.value as IPageSection["theme"],
                    )
                  }
                >
                  <option value="light">라이트</option>
                  <option value="dark">다크</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 pt-5 text-[14px]">
                <input
                  type="checkbox"
                  checked={section.lazy ?? false}
                  onChange={(e) => updateField(sIdx, "lazy", e.target.checked)}
                  className="h-4 w-4"
                />
                지연 로딩(스크롤 시 등장)
              </label>
            </div>

            <div>
              <label className={labelCls}>제목</label>
              <input
                className={field}
                value={section.title ?? ""}
                onChange={(e) => updateField(sIdx, "title", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>부제</label>
              <input
                className={field}
                value={section.subtitle ?? ""}
                onChange={(e) => updateField(sIdx, "subtitle", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>본문</label>
              <textarea
                className={field}
                rows={4}
                value={section.body ?? ""}
                onChange={(e) => updateField(sIdx, "body", e.target.value)}
              />
            </div>

            {isImageType(type) && (
              <div className="space-y-4 rounded-md border border-black/10 bg-[#fafafa] p-4">
                <div>
                  <label className={labelCls}>이미지 URL</label>
                  <input
                    className={field}
                    value={section.imageUrl ?? ""}
                    onChange={(e) =>
                      updateField(sIdx, "imageUrl", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>배경 이미지 URL</label>
                  <input
                    className={field}
                    value={section.backgroundImage ?? ""}
                    onChange={(e) =>
                      updateField(sIdx, "backgroundImage", e.target.value)
                    }
                  />
                </div>
                <div className="w-40">
                  <label className={labelCls}>이미지 위치</label>
                  <select
                    className={field}
                    value={section.imagePosition ?? "left"}
                    onChange={(e) =>
                      updateField(
                        sIdx,
                        "imagePosition",
                        e.target.value as IPageSection["imagePosition"],
                      )
                    }
                  >
                    <option value="left">왼쪽</option>
                    <option value="right">오른쪽</option>
                  </select>
                </div>
              </div>
            )}

            {isItemType(type) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-klead-gray-500">
                    항목 ({section.items?.length ?? 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem(sIdx)}
                    className="rounded-md border border-black/15 px-3 py-1 text-[13px] font-semibold"
                  >
                    + 항목 추가
                  </button>
                </div>
                {section.items?.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="space-y-2 rounded-md border border-black/10 bg-[#fafafa] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-klead-gray-400">
                        #{iIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(sIdx, iIdx)}
                        className="text-[12px] font-semibold text-red-600"
                      >
                        삭제
                      </button>
                    </div>
                    <input
                      className={field}
                      placeholder="제목"
                      value={item.title ?? ""}
                      onChange={(e) =>
                        updateItemField(sIdx, iIdx, "title", e.target.value)
                      }
                    />
                    <textarea
                      className={field}
                      rows={2}
                      placeholder="설명"
                      value={item.description ?? ""}
                      onChange={(e) =>
                        updateItemField(
                          sIdx,
                          iIdx,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                    <input
                      className={field}
                      placeholder="이미지 URL"
                      value={item.imageUrl ?? ""}
                      onChange={(e) =>
                        updateItemField(sIdx, iIdx, "imageUrl", e.target.value)
                      }
                    />
                    <input
                      className={field}
                      placeholder="아이콘 URL"
                      value={item.iconUrl ?? ""}
                      onChange={(e) =>
                        updateItemField(sIdx, iIdx, "iconUrl", e.target.value)
                      }
                    />
                    <input
                      className={field}
                      placeholder="링크 URL"
                      value={item.linkUrl ?? ""}
                      onChange={(e) =>
                        updateItemField(sIdx, iIdx, "linkUrl", e.target.value)
                      }
                    />
                    <textarea
                      className={field}
                      rows={3}
                      placeholder="세부 항목 (줄바꿈 구분)"
                      value={(item.bullets ?? []).join("\n")}
                      onChange={(e) =>
                        updateItemField(
                          sIdx,
                          iIdx,
                          "bullets",
                          e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-black/15 bg-white p-4">
        <select
          className={`${field} w-auto flex-1`}
          value={addType}
          onChange={(e) => setAddType(e.target.value as SectionType)}
        >
          {SECTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addSection}
          className="shrink-0 rounded-md bg-klead-primary px-5 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          구역 추가
        </button>
      </div>
    </div>
  );
}
