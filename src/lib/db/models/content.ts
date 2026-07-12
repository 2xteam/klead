import { Schema, model, models, type Model, type Types } from "mongoose";
import {
  AttachmentSchema,
  PageSectionSchema,
  PublishScheduleSchema,
  SeoMetaSchema,
} from "@/lib/db/schemas/common";

export type ContentType = "content" | "lecture";
export type ContentCategory =
  | "notice"
  | "resource"
  | "event"
  | "guide"
  | "community"
  | "about"
  | "expert_program"
  | "curator";
export type LectureCategory =
  | "waxing"
  | "eyebrow"
  | "scalp"
  | "face_design"
  | "skin_care"
  | "body_care"
  | "theory"
  | "business";

export interface IPageSectionItem {
  title?: string;
  subtitle?: string;
  description?: string;
  iconUrl?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  bullets?: string[];
  meta?: Record<string, unknown>;
  sortOrder: number;
}

export type SectionType =
  | "hero"
  | "richText"
  | "image"
  | "imageText"
  | "gallery"
  | "slider"
  | "cards"
  | "steps"
  | "profile"
  | "profileHeader"
  | "splitText"
  | "divider"
  | "linkCards"
  | "banner"
  | "partners"
  | "contact";

export interface IPageSection {
  key: string;
  type?: SectionType;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  backgroundImage?: string;
  theme?: "light" | "dark";
  imagePosition?: "left" | "right";
  lazy?: boolean;
  items?: IPageSectionItem[];
  bannerId?: string; // type === "banner" 일 때 참조하는 Banner _id
  sortOrder: number;
}

export interface IContent {
  _id: Types.ObjectId;
  slug: string;
  type: ContentType;
  contentCategory?: ContentCategory;
  lectureCategory?: LectureCategory;
  title: string;
  summary?: string;
  aiSummary?: string; // AI 상담사가 추천에 사용하는 강의 설명(선택)
  body: string;
  thumbnail?: string;
  gallery?: string[]; // 상품 상단 이미지 갤러리
  permissionTypeId?: Types.ObjectId; // 강의 열람에 필요한 권한(PermissionType)
  learnSections?: IPageSection[]; // 강의(학습) 페이지 콘텐츠 — 상품 페이지와 별도
  attachments: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    r2Key: string;
    publicUrl: string;
    uploadedAt: Date;
  }[];
  sections?: IPageSection[];
  relatedInstructorIds?: Types.ObjectId[];
  videoId?: string;
  videoDuration?: number;
  videoStatus?: "processing" | "ready" | "error";
  instructorId?: Types.ObjectId;
  lectureMode?: "online" | "offline" | "hybrid";
  chapters?: {
    title: string;
    videoId?: string;
    startTime?: number;
    sortOrder: number;
  }[];
  isPinned: boolean;
  isPublic: boolean;
  publish: {
    startDt?: Date;
    endDt?: Date;
    status: "draft" | "scheduled" | "published" | "expired";
  };
  priceDisplay?: "inquiry" | "free" | "amount";
  priceAmount?: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tagIds: Types.ObjectId[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ["content", "lecture"], required: true },
    contentCategory: {
      type: String,
      enum: [
        "notice",
        "resource",
        "event",
        "guide",
        "community",
        "about",
        "expert_program",
        "curator",
      ],
    },
    lectureCategory: {
      type: String,
      enum: [
        "waxing",
        "eyebrow",
        "scalp",
        "face_design",
        "skin_care",
        "body_care",
        "theory",
        "business",
      ],
    },
    title: { type: String, required: true },
    summary: String,
    aiSummary: String,
    body: { type: String, default: "" },
    thumbnail: String,
    gallery: [String],
    permissionTypeId: { type: Schema.Types.ObjectId, ref: "PermissionType" },
    learnSections: [PageSectionSchema],
    attachments: [AttachmentSchema],
    sections: [PageSectionSchema],
    relatedInstructorIds: [{ type: Schema.Types.ObjectId, ref: "Instructor" }],
    videoId: String,
    videoDuration: Number,
    videoStatus: {
      type: String,
      enum: ["processing", "ready", "error"],
    },
    instructorId: { type: Schema.Types.ObjectId, ref: "Instructor" },
    lectureMode: {
      type: String,
      enum: ["online", "offline", "hybrid"],
    },
    chapters: [
      {
        title: String,
        videoId: String,
        startTime: Number,
        sortOrder: Number,
      },
    ],
    isPinned: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    publish: {
      type: PublishScheduleSchema,
      default: () => ({ status: "draft" }),
    },
    priceDisplay: {
      type: String,
      enum: ["inquiry", "free", "amount"],
      default: "inquiry",
    },
    priceAmount: Number,
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    tagIds: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    seo: SeoMetaSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: Date,
  },
  { timestamps: true },
);

ContentSchema.index({ type: 1, "publish.status": 1, createdAt: -1 });
ContentSchema.index({ type: 1, lectureCategory: 1 });
ContentSchema.index({ type: 1, contentCategory: 1 });
ContentSchema.index({ isPinned: -1, createdAt: -1 });
ContentSchema.index({ tagIds: 1 });
ContentSchema.index({ instructorId: 1 });
ContentSchema.index({ "publish.startDt": 1, "publish.endDt": 1 });

export const Content: Model<IContent> =
  models.Content ?? model<IContent>("Content", ContentSchema);
