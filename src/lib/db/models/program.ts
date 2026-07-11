import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IProgram {
  _id: Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  priceMonthly?: number;
  priceYearly?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    priceMonthly: Number,
    priceYearly: Number,
  },
  { timestamps: true },
);

ProgramSchema.index({ isActive: 1, sortOrder: 1 });

export const Program: Model<IProgram> =
  models.Program ?? model<IProgram>("Program", ProgramSchema);
