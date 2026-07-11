import { Schema, model, models, type Model, type Types } from "mongoose";
import { AttachmentSchema } from "@/lib/db/schemas/common";

export interface IQnA {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  contentId?: Types.ObjectId;
  category?: string;
  title: string;
  body: string;
  attachments?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    r2Key: string;
    publicUrl: string;
    uploadedAt: Date;
  }[];
  status: "pending" | "answered" | "closed";
  isPrivate: boolean;
  answer?: {
    body: string;
    answeredBy: Types.ObjectId;
    answeredAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QnASchema = new Schema<IQnA>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contentId: { type: Schema.Types.ObjectId, ref: "Content" },
    category: String,
    title: { type: String, required: true },
    body: { type: String, required: true },
    attachments: [AttachmentSchema],
    status: {
      type: String,
      enum: ["pending", "answered", "closed"],
      default: "pending",
    },
    isPrivate: { type: Boolean, default: false },
    answer: {
      body: String,
      answeredBy: { type: Schema.Types.ObjectId, ref: "User" },
      answeredAt: Date,
    },
  },
  { timestamps: true },
);

QnASchema.index({ userId: 1, createdAt: -1 });
QnASchema.index({ status: 1, createdAt: -1 });
QnASchema.index({ contentId: 1 });

export const QnA: Model<IQnA> = models.QnA ?? model<IQnA>("QnA", QnASchema);
