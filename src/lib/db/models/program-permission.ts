import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IProgramPermission {
  _id: Types.ObjectId;
  programId: Types.ObjectId;
  permissionTypeId: Types.ObjectId;
  createdAt: Date;
}

const ProgramPermissionSchema = new Schema<IProgramPermission>(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: "Program",
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

ProgramPermissionSchema.index(
  { programId: 1, permissionTypeId: 1 },
  { unique: true },
);
ProgramPermissionSchema.index({ programId: 1 });

export const ProgramPermission: Model<IProgramPermission> =
  models.ProgramPermission ??
  model<IProgramPermission>("ProgramPermission", ProgramPermissionSchema);
