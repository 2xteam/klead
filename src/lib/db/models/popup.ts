import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IPopup {
  _id: Types.ObjectId;
  title: string;
  body?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkTarget: "_self" | "_blank";
  display: {
    startDt: Date;
    endDt: Date;
    showOnce: boolean;
    pages: string[];
  };
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PopupSchema = new Schema<IPopup>(
  {
    title: { type: String, required: true },
    body: String,
    imageUrl: String,
    linkUrl: String,
    linkTarget: { type: String, enum: ["_self", "_blank"], default: "_self" },
    display: {
      startDt: { type: Date, required: true },
      endDt: { type: Date, required: true },
      showOnce: { type: Boolean, default: true },
      pages: [{ type: String }],
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

PopupSchema.index({
  isActive: 1,
  "display.startDt": 1,
  "display.endDt": 1,
});

export const Popup: Model<IPopup> =
  models.Popup ?? model<IPopup>("Popup", PopupSchema);
