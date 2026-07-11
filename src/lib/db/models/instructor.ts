import { Schema, model, models, type Model, type Types } from "mongoose";
import { SeoMetaSchema } from "@/lib/db/schemas/common";

export interface IInstructor {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  title?: string;
  bio: string;
  profileImage?: string;
  specialties: string[];
  career?: string;
  snsLinks?: {
    instagram?: string;
    youtube?: string;
  };
  sortOrder: number;
  isPublished: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const InstructorSchema = new Schema<IInstructor>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    title: String,
    bio: { type: String, default: "" },
    profileImage: String,
    specialties: [{ type: String }],
    career: String,
    snsLinks: {
      instagram: String,
      youtube: String,
    },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    seo: SeoMetaSchema,
  },
  { timestamps: true },
);

InstructorSchema.index({ isPublished: 1, sortOrder: 1 });

export const Instructor: Model<IInstructor> =
  models.Instructor ?? model<IInstructor>("Instructor", InstructorSchema);
