import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import { Content, Menu } from "@/lib/db/models";

/**
 * 슬러그 중복 확인 — 관리자.
 * GET /api/admin/slug-check?scope=content|menu&slug=xxx&exclude=<id>
 * → { available: boolean }
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") ?? "content";
  const slug = (url.searchParams.get("slug") ?? "").trim();
  const exclude = url.searchParams.get("exclude") ?? "";

  if (!slug) {
    return NextResponse.json({ available: false, error: "slug 필요" });
  }
  // 형식 검증: 영문 소문자/숫자/하이픈만
  if (!/^[a-z0-9가-힣-]+$/.test(slug)) {
    return NextResponse.json({
      available: false,
      error: "영문 소문자·숫자·하이픈만 사용하세요.",
    });
  }

  await connectDB();
  const filter: Record<string, unknown> = { slug };
  if (exclude && mongoose.isValidObjectId(exclude)) {
    filter._id = { $ne: exclude };
  }
  const found =
    scope === "menu"
      ? await Menu.findOne(filter).select("_id").lean()
      : await Content.findOne(filter).select("_id").lean();
  return NextResponse.json({ available: !found });
}
