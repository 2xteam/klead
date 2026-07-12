import { NextResponse } from "next/server";
import {
  createAiConversation,
  runAiTurn,
  isOpenAiConfigured,
} from "@/lib/ai/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { conversationId?, message, pageContext? } → { conversationId, reply, cards } */
export async function POST(req: Request) {
  if (!isOpenAiConfigured()) {
    return NextResponse.json(
      { error: "AI 상담사가 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 },
    );
  }

  let body: { conversationId?: unknown; message?: unknown; pageContext?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 2000) {
    return NextResponse.json({ error: "메시지를 입력해 주세요." }, { status: 422 });
  }
  const pageContext =
    typeof body.pageContext === "string" ? body.pageContext.slice(0, 200) : undefined;

  try {
    const conversationId =
      typeof body.conversationId === "string" && body.conversationId.startsWith("conv_")
        ? body.conversationId
        : await createAiConversation();

    const { reply, cards } = await runAiTurn({ conversationId, userText: message, pageContext });
    return NextResponse.json({ conversationId, reply, cards });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ai/chat]", msg);
    return NextResponse.json(
      { error: "상담 응답 생성 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
