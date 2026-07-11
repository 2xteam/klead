import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IContentPermission {
  _id: Types.ObjectId;
  contentId: Types.ObjectId;
  permissionTypeId: Types.ObjectId;
  createdAt: Date;
}

const ContentPermissionSchema = new Schema<IContentPermission>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },
    permissionTypeId: {
      type: Schema.Types.ObjectId,
      ref: "PermissionType",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ContentPermissionSchema.index(
  { contentId: 1, permissionTypeId: 1 },
  { unique: true },
);
ContentPermissionSchema.index({ contentId: 1 });
ContentPermissionSchema.index({ permissionTypeId: 1 });

export const ContentPermission: Model<IContentPermission> =
  models.ContentPermission ??
  model<IContentPermission>("ContentPermission", ContentPermissionSchema);
