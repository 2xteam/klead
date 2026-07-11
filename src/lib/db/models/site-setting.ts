import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ISiteSetting {
  _id: Types.ObjectId;
  key: string;
  value: unknown;
  group: "general" | "header" | "footer" | "sns" | "seo" | "company";
  description?: string;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    group: {
      type: String,
      enum: ["general", "header", "footer", "sns", "seo", "company"],
      default: "general",
    },
    description: String,
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export const SiteSetting: Model<ISiteSetting> =
  models.SiteSetting ??
  model<ISiteSetting>("SiteSetting", SiteSettingSchema);
