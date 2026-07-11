import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IFaq {
  _id: Types.ObjectId;
  category?: string;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    category: String,
    question: { type: String, required: true },
    answer: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

FaqSchema.index({ isPublished: 1, sortOrder: 1 });
FaqSchema.index({ category: 1, sortOrder: 1 });

export const Faq: Model<IFaq> = models.Faq ?? model<IFaq>("Faq", FaqSchema);
