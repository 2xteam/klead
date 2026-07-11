import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ISubscription {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  programId: Types.ObjectId;
  status: "active" | "expired" | "cancelled" | "pending";
  startAt: Date;
  endAt: Date;
  paymentId?: Types.ObjectId;
  autoRenew: boolean;
  grantedBy?: Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "active",
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    autoRenew: { type: Boolean, default: false },
    grantedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: String,
  },
  { timestamps: true },
);

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ userId: 1, programId: 1 });
SubscriptionSchema.index({ endAt: 1, status: 1 });

export const Subscription: Model<ISubscription> =
  models.Subscription ??
  model<ISubscription>("Subscription", SubscriptionSchema);
