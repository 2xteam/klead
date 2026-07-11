import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IPermissionType {
  _id: Types.ObjectId;
  code: string;
  name: string;
  category: string;
  level?: "basic" | "master" | "expert";
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionTypeSchema = new Schema<IPermissionType>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ["basic", "master", "expert"] },
    description: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

PermissionTypeSchema.index({ category: 1, level: 1 });

export const PermissionType: Model<IPermissionType> =
  models.PermissionType ??
  model<IPermissionType>("PermissionType", PermissionTypeSchema);
