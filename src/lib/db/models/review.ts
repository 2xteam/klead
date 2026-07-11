import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IReview {
  _id: Types.ObjectId;
  contentId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  title?: string;
  body: string;
  images?: string[];
  isVisible: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: String,
    body: { type: String, required: true },
    images: [String],
    isVisible: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ReviewSchema.index({ contentId: 1, createdAt: -1 });
ReviewSchema.index({ contentId: 1, userId: 1 }, { unique: true });
ReviewSchema.index({ isFeatured: 1, createdAt: -1 });

export const Review: Model<IReview> =
  models.Review ?? model<IReview>("Review", ReviewSchema);
