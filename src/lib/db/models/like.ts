import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ILike {
  _id: Types.ObjectId;
  contentId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

LikeSchema.index({ contentId: 1, userId: 1 }, { unique: true });
LikeSchema.index({ contentId: 1 });
LikeSchema.index({ userId: 1 });

export const Like: Model<ILike> =
  models.Like ?? model<ILike>("Like", LikeSchema);
