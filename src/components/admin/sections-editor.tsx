"use client";

import { useEffect, useState } from "react";
import type {
  IPageSection,
  IPageSectionItem,
  SectionType,
} from "@/lib/db/models/content";
import { SECTION_TYPE_LABELS } from "@/lib/content/section-types";
import { ImageInput, ImageListInput } from "@/components/admin/image-input";
import { SectionTypePicker } from "@/components/admin/section-type-picker";

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-[14px] focus:border-klead-primary focus:outline-none";
const labelCls = "mb-1 block text-[13px] font-semibold text-klead-gray-500";

const TYPE_LABEL = SECTION_TYPE_LABELS;

/** imageUrl 필드를 쓰는 타입 */
const IMAGE_URL_TYPES: SectionType[] = [
  "hero",
  "image",
  "imageText",
  "profile",
  "profileHeader",
];
/** backgroundImage 필드를 쓰는 타입 */
const BG_IMAGE_TYPES: SectionType[] = ["hero", "profile", "profileHeader"];
/** imagePosition 필드를 쓰는 타입 */
const IMAGE_POS_TYPES: SectionType[] = ["imageText", "slider", "profileHeader"];
/** 이미지 목록(갤러리 슬라이더)을 쓰는 타입 */
const GALLERY_TYPES: SectionType[] = ["gallery", "slider"];
/** 일반 items 배열(제목/설명/이미지/링크)을 쓰는 타입 */
const ITEM_TYPES: SectionType[] = [
  "cards",
  "steps",
  "partners",
  "contact",
  "imageText",
  "profile",
  "linkCards",
];

/** 제목을 쓰지 않는 타입(슬라이더=이미지목록, 배너=배너선택) */
const NO_TITLE_TYPES: SectionType[] = ["slider", "banner", "divider"];
/** 부제를 쓰는 타입 */
const SUBTITLE_TYPES: SectionType[] = [
  "hero",
  "richText",
  "imageText",
  "profile",
  "profileHeader",
  "linkCards",
];
/** 본문을 쓰는 타입 */
const BODY_TYPES: SectionType[] = [
  "hero",
  "richText",
  "imageText",
  "profile",
  "profileHeader",
  "splitText",
];

/** item(항목)별 노출 필드 */
type ItemField =
  | "title"
  | "description"
  | "imageUrl"
  | "iconUrl"
  | "linkUrl"
  | "bullets";
const ITEM_FIELDS: Partial<Record<SectionType, ItemField[]>> = {
  cards: ["iconUrl", "title", "description"],
  steps: ["title", "bullets"],
  imageText: ["title"],
  profile: ["title", "description"],
  linkCards: ["imageUrl", "title", "linkUrl"],
  banner: ["imageUrl"],
  partners: ["imageUrl", "title"],
  contact: ["title", "description", "linkUrl"],
};

function hasImageUrl(t: SectionType) {
  return IMAGE_URL_TYPES.includes(t);
}
function hasBgImage(t: SectionType) {
  return BG_IMAGE_TYPES.includes(t);
}
function hasImagePos(t: SectionType) {
  return IMAGE_POS_TYPES.includes(t);
}
function isGalleryType(t: SectionType) {
  return GALLERY_TYPES.includes(t);
}
function isItemType(t: SectionType) {
  return ITEM_TYPES.includes(t);
}
function showTitle(t: SectionType) {
  return !NO_TITLE_TYPES.includes(t);
}
function showSubtitle(t: SectionType) {
  return SUBTITLE_TYPES.includes(t);
}
function showBody(t: SectionType) {
  return BODY_TYPES.includes(t);
}
function itemShow(t: SectionType, f: ItemField) {
  const fields = ITEM_FIELDS[t];
  return fields ? fields.includes(f) : true;
}
/** 타입별 라벨(문맥) */
function bodyLabel(t: SectionType) {
  if (t === "splitText") return "본문 (줄바꿈 = 목록 항목)";
  if (t === "profile") return "경력 (줄바꿈으로 구분)";
  return "본문";
}
function itemsLabel(t: SectionType) {
  switch (t) {
    case "profile":
      return "실적/수치";
    case "linkCards":
      return "링크 카드";
    case "banner":
    case "partners":
      return "로고";
    case "contact":
      return "연락처 항목";
    default:
      return "항목";
  }
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
    items: isItemType(type) || isGalleryType(type) ? [] : undefined,
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
  const [banners, setBanners] = useState<{ _id: string; name: string }[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/admin/banners")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => {
        if (alive) setBanners(d.items ?? []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  function mutate(fn: (draft: IPageSection[]) => void) {
    const draft = structuredClone(value);
    fn(draft);
    onChange(resequence(draft));
  }

  function addSectionOfType(t: SectionType) {
    mutate((d) => {
      d.push(emptySection(t, d.length));
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

            {showTitle(type) && (
              <div>
                <label className={labelCls}>제목</label>
                <input
                  className={field}
                  value={section.title ?? ""}
                  onChange={(e) => updateField(sIdx, "title", e.target.value)}
                />
              </div>
            )}
            {showSubtitle(type) && (
              <div>
                <label className={labelCls}>부제</label>
                <input
                  className={field}
                  value={section.subtitle ?? ""}
                  onChange={(e) =>
                    updateField(sIdx, "subtitle", e.target.value)
                  }
                />
              </div>
            )}
            {showBody(type) && (
              <div>
                <label className={labelCls}>{bodyLabel(type)}</label>
                <textarea
                  className={field}
                  rows={4}
                  value={section.body ?? ""}
                  onChange={(e) => updateField(sIdx, "body", e.target.value)}
                />
              </div>
            )}

            {(hasImageUrl(type) || hasBgImage(type) || hasImagePos(type)) && (
              <div className="space-y-4 rounded-md border border-black/10 bg-[#fafafa] p-4">
                {hasImageUrl(type) && (
                  <div>
                    <label className={labelCls}>이미지</label>
                    <ImageInput
                      value={section.imageUrl ?? ""}
                      onChange={(v) => updateField(sIdx, "imageUrl", v)}
                      folder="content"
                    />
                  </div>
                )}
                {hasBgImage(type) && (
                  <div>
                    <label className={labelCls}>배경 이미지</label>
                    <ImageInput
                      value={section.backgroundImage ?? ""}
                      onChange={(v) => updateField(sIdx, "backgroundImage", v)}
                      folder="content"
                    />
                  </div>
                )}
                {hasImagePos(type) && (
                  <div className="w-40">
                    <label className={labelCls}>
                      {type === "slider" ? "슬라이드 방향" : "이미지 위치"}
                    </label>
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
                      <option value="left">
                        {type === "slider" ? "← 왼쪽으로" : "왼쪽"}
                      </option>
                      <option value="right">
                        {type === "slider" ? "→ 오른쪽으로" : "오른쪽"}
                      </option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {isGalleryType(type) && (
              <div className="rounded-md border border-black/10 bg-[#fafafa] p-4">
                <ImageListInput
                  folder="gallery"
                  value={(section.items ?? [])
                    .map((it) => it.imageUrl)
                    .filter((u): u is string => !!u)}
                  onChange={(urls) =>
                    updateField(
                      sIdx,
                      "items",
                      urls.map((imageUrl, i) => ({ imageUrl, sortOrder: i })),
                    )
                  }
                />
              </div>
            )}

            {type === "banner" && (
              <div className="space-y-2 rounded-md border border-black/10 bg-[#fafafa] p-4">
                <label className={labelCls}>배너 선택 (배너 관리에서 등록)</label>
                <select
                  className={field}
                  value={section.bannerId ?? ""}
                  onChange={(e) => updateField(sIdx, "bannerId", e.target.value)}
                >
                  <option value="">— 배너를 선택하세요 —</option>
                  {banners.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <p className="text-[12px] text-klead-gray-400">
                  선택한 배너의 배경·제목·로고가 이 구역에 표시됩니다.
                  <a
                    href="/admin/banners"
                    target="_blank"
                    className="ml-1 text-klead-primary hover:underline"
                  >
                    배너 관리 →
                  </a>
                </p>
              </div>
            )}

            {isItemType(type) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-klead-gray-500">
                    {itemsLabel(type)} ({section.items?.length ?? 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem(sIdx)}
                    className="rounded-md border border-black/15 px-3 py-1 text-[13px] font-semibold"
                  >
                    + 추가
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
                    {itemShow(type, "imageUrl") && (
                      <div>
                        <label className={labelCls}>이미지</label>
                        <ImageInput
                          value={item.imageUrl ?? ""}
                          onChange={(v) =>
                            updateItemField(sIdx, iIdx, "imageUrl", v)
                          }
                          folder="content"
                        />
                      </div>
                    )}
                    {itemShow(type, "iconUrl") && (
                      <div>
                        <label className={labelCls}>아이콘</label>
                        <ImageInput
                          value={item.iconUrl ?? ""}
                          onChange={(v) =>
                            updateItemField(sIdx, iIdx, "iconUrl", v)
                          }
                          folder="content"
                        />
                      </div>
                    )}
                    {itemShow(type, "title") && (
                      <input
                        className={field}
                        placeholder={type === "profile" ? "제목(수치 앞 문구)" : "제목"}
                        value={item.title ?? ""}
                        onChange={(e) =>
                          updateItemField(sIdx, iIdx, "title", e.target.value)
                        }
                      />
                    )}
                    {itemShow(type, "description") && (
                      <textarea
                        className={field}
                        rows={2}
                        placeholder={
                          type === "profile" ? "강조 수치(볼드)" : "설명"
                        }
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
                    )}
                    {itemShow(type, "linkUrl") && (
                      <input
                        className={field}
                        placeholder="링크 URL"
                        value={item.linkUrl ?? ""}
                        onChange={(e) =>
                          updateItemField(sIdx, iIdx, "linkUrl", e.target.value)
                        }
                      />
                    )}
                    {itemShow(type, "bullets") && (
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
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <SectionTypePicker onAdd={addSectionOfType} />
    </div>
  );
}
