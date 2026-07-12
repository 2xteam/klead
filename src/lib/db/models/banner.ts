import { Schema, model, models, type Model, type Types } from "mongoose";

/**
 * 재사용 배너 (파트너사 등). 콘텐츠 섹션(type: "banner")에서 bannerId로 참조한다.
 * 배너를 수정하면 이를 참조하는 모든 콘텐츠에 반영된다.
 */
export interface IBanner {
  _id: Types.ObjectId;
  name: string; // 관리용 이름
  subtitle?: string; // 상단 라벨 (예: 파트너사 현황)
  title?: string; // 큰 제목 (예: 클리드와 함께하는 파트너들)
  backgroundImage?: string;
  logos: string[]; // 로고 이미지 URL 목록
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    name: { type: String, required: true },
    subtitle: { type: String, default: "" },
    title: { type: String, default: "" },
    backgroundImage: { type: String, default: "" },
    logos: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

BannerSchema.index({ isActive: 1, updatedAt: -1 });

export const Banner: Model<IBanner> =
  models.Banner ?? model<IBanner>("Banner", BannerSchema);
