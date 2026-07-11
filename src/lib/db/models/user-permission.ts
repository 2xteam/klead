import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IUserPermission {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  permissionTypeId: Types.ObjectId;
  source: "manual" | "subscription" | "promotion";
  sourceId?: Types.ObjectId;
  startAt?: Date;
  endAt?: Date;
  grantedBy?: Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserPermissionSchema = new Schema<IUserPermission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    permissionTypeId: {
      type: Schema.Types.ObjectId,
      ref: "PermissionType",
      required: true,
    },
    source: {
      type: String,
      enum: ["manual", "subscription", "promotion"],
      default: "manual",
    },
    sourceId: Schema.Types.ObjectId,
    startAt: Date,
    endAt: Date,
    grantedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: String,
  },
  { timestamps: true },
);

UserPermissionSchema.index({ userId: 1, permissionTypeId: 1 });
UserPermissionSchema.index({ userId: 1, endAt: 1 });

export const UserPermission: Model<IUserPermission> =
  models.UserPermission ??
  model<IUserPermission>("UserPermission", UserPermissionSchema);
