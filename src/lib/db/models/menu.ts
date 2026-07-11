import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IMenu {
  _id: Types.ObjectId;
  parentId?: Types.ObjectId;
  slug: string;
  name: string;
  path?: string;
  linkType: "internal" | "external" | "folder";
  externalUrl?: string;
  depth: number;
  sortOrder: number;
  isVisible: boolean;
  icon?: string;
  badge?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MenuSchema = new Schema<IMenu>(
  {
    parentId: { type: Schema.Types.ObjectId, ref: "Menu" },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    path: String,
    linkType: {
      type: String,
      enum: ["internal", "external", "folder"],
      default: "internal",
    },
    externalUrl: String,
    depth: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    icon: String,
    badge: String,
  },
  { timestamps: true },
);

MenuSchema.index({ parentId: 1, sortOrder: 1 });
MenuSchema.index({ isVisible: 1 });

export const Menu: Model<IMenu> =
  models.Menu ?? model<IMenu>("Menu", MenuSchema);
