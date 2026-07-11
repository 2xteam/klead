import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IInstagramPost {
  _id: Types.ObjectId;
  image: string;
  link: string;
  caption?: string; // 마우스 오버 시 노출 텍스트
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InstagramPostSchema = new Schema<IInstagramPost>(
  {
    image: { type: String, required: true },
    link: { type: String, default: "" },
    caption: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

InstagramPostSchema.index({ isActive: 1, sortOrder: 1 });

export const InstagramPost: Model<IInstagramPost> =
  models.InstagramPost ??
  model<IInstagramPost>("InstagramPost", InstagramPostSchema);
