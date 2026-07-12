import { Schema } from "mongoose";
import { SECTION_TYPES } from "@/lib/content/section-types";

export { SECTION_TYPES } from "@/lib/content/section-types";
export type { SectionType } from "@/lib/content/section-types";

export const SeoMetaSchema = new Schema(
  {
    title: { type: String, maxlength: 70 },
    description: { type: String, maxlength: 160 },
    keywords: [{ type: String }],
    ogImage: String,
    ogTitle: String,
    ogDescription: String,
    noIndex: { type: Boolean, default: false },
  },
  { _id: false },
);

export const PublishScheduleSchema = new Schema(
  {
    startDt: Date,
    endDt: Date,
    status: {
      type: String,
      enum: ["draft", "scheduled", "published", "expired"],
      default: "draft",
    },
  },
  { _id: false },
);

export const AttachmentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    r2Key: { type: String, required: true },
    publicUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

/** 랜딩/소개 페이지용 구조화 섹션 (전문가 과정 등) */
export const PageSectionItemSchema = new Schema(
  {
    title: String,
    subtitle: String,
    description: String,
    iconUrl: String,
    imageUrl: String,
    linkUrl: String,
    linkLabel: String,
    bullets: [{ type: String }],
    meta: { type: Schema.Types.Mixed },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

export const PageSectionSchema = new Schema(
  {
    key: { type: String, required: true }, // 앵커 id / 식별자
    type: { type: String, enum: SECTION_TYPES, default: "richText" },
    title: String,
    subtitle: String,
    body: String,
    imageUrl: String,
    backgroundImage: String,
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    imagePosition: { type: String, enum: ["left", "right"], default: "left" },
    lazy: { type: Boolean, default: false }, // 스크롤 시 지연 등장(fade-in-up)
    items: [PageSectionItemSchema],
    bannerId: String, // type "banner" 참조
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);
