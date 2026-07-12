import { Schema, model, models, type Model, type Types } from "mongoose";

/**
 * 강의 열람권(수강권). 구매·수동부여·임시(시크릿키)를 하나의 테이블로 관리한다.
 * - source "purchase"|"manual": userId 지정(회원 귀속)
 * - source "secret": userId 없이 secretKeyHash + code 로 URL 공유 열람
 */
export type LectureAccessSource = "purchase" | "manual" | "secret";

export interface ILectureAccess {
  _id: Types.ObjectId;
  contentId: Types.ObjectId; // 강의(Content lecture)
  userId?: Types.ObjectId | null; // 회원 귀속(시크릿키형은 null)
  source: LectureAccessSource;
  code: string; // 공개 식별 토큰(URL 공유용) — 고유
  secretKeyHash?: string; // 검증용 SHA-256 해시(공개 노출 금지)
  secretKey?: string; // 관리자 표시용 평문(관리자 화면에서만 조회) — 공유 코드 성격
  gateTtlHours?: number; // 시크릿키 검증 후 재입력 없이 유지할 시간(시간). 기본 24

  startAt?: Date | null;
  endAt?: Date | null; // null = 무기한
  isActive: boolean;
  grantedBy?: Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LectureAccessSchema = new Schema<ILectureAccess>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    source: {
      type: String,
      enum: ["purchase", "manual", "secret"],
      required: true,
    },
    code: { type: String, required: true, unique: true },
    secretKeyHash: { type: String },
    secretKey: { type: String },
    gateTtlHours: { type: Number, default: 24 },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    grantedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: String,
  },
  { timestamps: true },
);

LectureAccessSchema.index({ contentId: 1, userId: 1 });
LectureAccessSchema.index({ userId: 1, isActive: 1 });

export const LectureAccess: Model<ILectureAccess> =
  models.LectureAccess ??
  model<ILectureAccess>("LectureAccess", LectureAccessSchema);
