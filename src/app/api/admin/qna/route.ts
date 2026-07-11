import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { QnA, User } from "@/lib/db/models";

/** Q&A 목록 — 관리자 */
export async function GET() {
  await connectDB();
  const docs = await QnA.find({})
    .select("title status isPrivate userId createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const userIds = [...new Set(docs.map((d) => d.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } })
    .select("name")
    .lean();
  const userNameMap = new Map(users.map((u) => [u._id.toString(), u.name]));

  return NextResponse.json({
    items: docs.map((d) => ({
      id: d._id.toString(),
      title: d.title,
      status: d.status,
      isPrivate: d.isPrivate,
      authorName: userNameMap.get(d.userId.toString()) ?? null,
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    })),
  });
}
