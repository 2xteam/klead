/**
 * KLEAD AI 상담사 대화 실행 (OpenAI Responses + Conversations API + tools).
 * SnapWord의 conversation-state 패턴을 재사용하되, 함수 도구 호출 루프를 추가한다.
 */
import OpenAI from "openai";
import { loadKleadKnowledge } from "@/lib/ai/knowledge";
import { KLEAD_AI_PERSONA } from "@/lib/ai/persona";
import { KLEAD_TOOLS, runTool, type AiCard } from "@/lib/ai/tools";

function getClient(): OpenAI {
  // 환경변수 값 끝에 개행/공백/따옴표가 섞여도 안전하도록 정리
  const apiKey = process.env.OPENAI_API_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!apiKey) throw new Error("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.");
  return new OpenAI({ apiKey });
}

export function isOpenAiConfigured(): boolean {
  const k = process.env.OPENAI_API_KEY?.trim();
  return !!k && k.length >= 20 && k.startsWith("sk-");
}

/** 대화 객체(conv_...) 생성 */
export async function createAiConversation(): Promise<string> {
  const conv = await getClient().conversations.create();
  const id = conv.id?.trim();
  if (!id) throw new Error("OpenAI conversation id가 비어 있습니다.");
  return id;
}

export interface AiTurnResult {
  reply: string;
  cards: AiCard[];
}

/**
 * 답변 본문의 마크다운 링크를 항상 사이트 내부 상대 경로(/slug)로 정규화한다.
 * 모델이 도메인(klead.co.kr 등)이나 http(s)를 붙여도 경로만 남긴다.
 */
function toRelativeLinks(md: string): string {
  return md.replace(/\]\(\s*([^)]+?)\s*\)/g, (full, rawHref: string) => {
    const h = rawHref.trim();
    if (h.startsWith("/") || h.startsWith("#") || h.startsWith("mailto:")) {
      return `](${h})`;
    }
    // scheme://host/path  또는  //host/path  →  /path
    let m = h.match(/^(?:https?:)?\/\/[^/]+(\/[^\s]*)$/i);
    if (m) return `](${m[1]})`;
    // host.tld/path (스킴 없음) → /path
    m = h.match(/^[a-z0-9-]+(?:\.[a-z0-9-]+)+(\/[^\s]*)$/i);
    if (m) return `](${m[1]})`;
    // bare-slug → /bare-slug
    if (/^[a-z0-9][a-z0-9-]*$/i.test(h)) return `](/${h})`;
    return full;
  });
}

type OutputItem = {
  type?: string;
  name?: string;
  arguments?: string;
  call_id?: string;
};

type CreateBody = Parameters<OpenAI["responses"]["create"]>[0];
type InputParam = CreateBody["input"];

/** 한 턴 응답. 함수 도구가 호출되면 실행 결과를 돌려주고 최종 텍스트까지 이어간다. */
export async function runAiTurn(params: {
  conversationId: string;
  userText: string;
  pageContext?: string;
}): Promise<AiTurnResult> {
  const client = getClient();
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const kb = await loadKleadKnowledge();

  const instructions = [
    KLEAD_AI_PERSONA,
    "",
    kb.ragText,
    params.pageContext
      ? `\n[현재 방문자가 보고 있는 페이지] ${params.pageContext}`
      : "",
  ].join("\n");

  let input: InputParam = [
    { role: "user", content: params.userText.trim() },
  ] as InputParam;
  const cards: AiCard[] = [];
  let reply = "";

  for (let i = 0; i < 4; i++) {
    const res = await client.responses.create({
      model,
      instructions,
      input,
      conversation: params.conversationId,
      tools: KLEAD_TOOLS,
      store: true,
    });

    const items = (res.output ?? []) as OutputItem[];
    const calls = items.filter((o) => o.type === "function_call");

    if (calls.length === 0) {
      reply = res.output_text?.trim() ?? "";
      break;
    }

    const outputs: Array<{ type: "function_call_output"; call_id: string; output: string }> =
      [];
    for (const call of calls) {
      if (!call.call_id || !call.name) continue;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      const r = runTool(call.name, args, kb);
      cards.push(...r.cards);
      outputs.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: r.model,
      });
    }
    input = outputs as unknown as InputParam;
  }

  if (!reply) {
    reply = "죄송해요, 다시 한 번 말씀해 주시겠어요? 조금만 더 자세히 알려주시면 딱 맞게 찾아드릴게요.";
  }
  reply = toRelativeLinks(reply);

  // href 기준 카드 중복 제거
  const seen = new Set<string>();
  const uniqueCards = cards.filter((c) => {
    if (seen.has(c.href)) return false;
    seen.add(c.href);
    return true;
  });

  return { reply, cards: uniqueCards };
}
