import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  contentId: Types.ObjectId;
  userId: Types.ObjectId;
  parentId?: Types.ObjectId;
  body: string;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    body: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

CommentSchema.index({ contentId: 1, createdAt: -1 });
CommentSchema.index({ contentId: 1, parentId: 1 });
CommentSchema.index({ userId: 1 });

export const Comment: Model<IComment> =
  models.Comment ?? model<IComment>("Comment", CommentSchema);
