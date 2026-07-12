import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { uploadObject } from "@/lib/storage/r2";

/** 관리자 이미지 업로드 → R2 이관 후 공개 URL 반환. (proxy.ts에서 admin 권한 게이트) */
export const runtime = "nodejs";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file 필드가 필요합니다." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: `지원하지 않는 형식: ${file.type}` },
        { status: 400 },
      );
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "최대 15MB까지 업로드 가능합니다." }, { status: 400 });
    }

    const folder = (form.get("folder") as string | null) ?? "content";
    const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "");
    const ext = EXT[file.type] ?? "bin";
    const key = `klead/${safeFolder}/${randomUUID()}.${ext}`;

    const buf = Buffer.from(await file.arrayBuffer());
    const { publicUrl } = await uploadObject({
      key,
      body: buf,
      contentType: file.type,
    });

    return NextResponse.json({ url: publicUrl, key });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "업로드 실패" },
      { status: 500 },
    );
  }
}
