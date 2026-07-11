import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IMenuContent {
  _id: Types.ObjectId;
  menuId: Types.ObjectId;
  contentId: Types.ObjectId;
  sortOrder: number;
  createdAt: Date;
}

const MenuContentSchema = new Schema<IMenuContent>(
  {
    menuId: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
    contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

MenuContentSchema.index({ menuId: 1, contentId: 1 }, { unique: true });
MenuContentSchema.index({ menuId: 1, sortOrder: 1 });
MenuContentSchema.index({ contentId: 1 });

export const MenuContent: Model<IMenuContent> =
  models.MenuContent ?? model<IMenuContent>("MenuContent", MenuContentSchema);
