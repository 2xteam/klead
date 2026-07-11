import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  email?: string;
  name: string;
  nickname?: string;
  profileImage?: string;
  phone?: string;
  authProvider: "kakao" | "test";
  authProviderId: string;
  role: "member" | "admin";
  status: "active" | "suspended" | "withdrawn";
  notificationPrefs: {
    notice: boolean;
    marketing: boolean;
    qnaReply: boolean;
  };
  lastLoginAt?: Date;
  withdrawnAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: String,
    name: { type: String, required: true },
    nickname: String,
    profileImage: String,
    phone: String,
    authProvider: {
      type: String,
      enum: ["kakao", "test"],
      required: true,
    },
    authProviderId: { type: String, required: true },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    status: {
      type: String,
      enum: ["active", "suspended", "withdrawn"],
      default: "active",
    },
    notificationPrefs: {
      notice: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      qnaReply: { type: Boolean, default: true },
    },
    lastLoginAt: Date,
    withdrawnAt: Date,
  },
  { timestamps: true },
);

UserSchema.index({ authProvider: 1, authProviderId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { sparse: true, unique: true });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

export const User: Model<IUser> =
  models.User ?? model<IUser>("User", UserSchema);
