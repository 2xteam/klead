import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { User } from "@/lib/db/models";

export async function GET() {
  await connectDB();
  const docs = await User.find({})
    .select("name email authProvider role status createdAt lastLoginAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    members: docs.map((d) => ({
      id: String(d._id),
      name: d.name,
      email: d.email ?? null,
      authProvider: d.authProvider,
      role: d.role,
      status: d.status,
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
      lastLoginAt: d.lastLoginAt
        ? new Date(d.lastLoginAt).toISOString()
        : null,
    })),
  });
}
