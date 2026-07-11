import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ITag {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  usageCount: number;
  createdAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

TagSchema.index({ name: 1 });

export const Tag: Model<ITag> = models.Tag ?? model<ITag>("Tag", TagSchema);
