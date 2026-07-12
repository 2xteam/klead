/**
 * KLEAD AI 상담사 도구(tools) 선언 + 실행기.
 * OpenAI Responses API 함수 도구 포맷({ type:"function", name, description, parameters }).
 * 실행 결과는 (1) 모델에 돌려줄 요약 문자열과 (2) UI가 렌더링할 카드 배열을 함께 반환한다.
 */
import type { KleadKnowledge } from "@/lib/ai/knowledge";

export type AiCard =
  | { kind: "course"; title: string; subtitle: string; price: string; href: string }
  | { kind: "curator"; title: string; subtitle: string; href: string }
  | { kind: "program"; title: string; subtitle: string; price: string; href: string };

export interface ToolResult {
  model: string; // 모델에 돌려줄 텍스트(무엇을 찾았는지)
  cards: AiCard[];
}

/** Responses API tools 선언 */
export const KLEAD_TOOLS = [
  {
    type: "function" as const,
    name: "recommend_courses",
    description:
      "방문자의 상황/관심 분야에 맞는 클리드 강의를 찾아 카드로 보여준다. 특정 기술을 배우고 싶을 때 사용.",
    parameters: {
      type: "object",
      properties: {
        keywords: {
          type: "string",
          description: "관심 주제/상황 키워드 (예: '왁싱 창업', '눈썹 입문', '두피')",
        },
        categories: {
          type: "array",
          items: { type: "string" },
          description:
            "카테고리(한글 또는 영문): 왁싱/눈썹/두피관리/페이스디자인/피부관리/바디관리/이론/경영",
        },
        limit: { type: "number", description: "추천 개수(기본 3, 최대 6)" },
      },
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "recommend_subscription",
    description:
      "여러 분야가 두루 필요하거나 장기 학습·창업 준비 등으로 정기 구독권(프로그램)이 유리할 때, 구독 프로그램을 카드로 안내한다.",
    parameters: {
      type: "object",
      properties: {
        reason: { type: "string", description: "구독을 추천하는 이유(짧게)" },
      },
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "recommend_curator",
    description:
      "특정 분야의 전문 강사(테크 큐레이터)를 소개하고 프로필 페이지로 이동시킨다.",
    parameters: {
      type: "object",
      properties: {
        keywords: {
          type: "string",
          description: "분야/이름 키워드 (예: '왁싱', '두피', '헤드스파', '경영')",
        },
        limit: { type: "number", description: "소개 인원(기본 2, 최대 4)" },
      },
      additionalProperties: false,
    },
    strict: false,
  },
];

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

function scoreByText(haystack: string, needles: string[]): number {
  const h = norm(haystack);
  let score = 0;
  for (const n of needles) {
    const t = norm(n);
    if (t.length >= 1 && h.includes(t)) score += 3;
  }
  return score;
}

function splitKeywords(kw?: string): string[] {
  if (!kw) return [];
  return kw
    .split(/[\s,·/]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 1);
}

export function runTool(
  name: string,
  args: Record<string, unknown>,
  kb: KleadKnowledge,
): ToolResult {
  if (name === "recommend_courses") {
    const kw = splitKeywords(typeof args.keywords === "string" ? args.keywords : "");
    const cats = Array.isArray(args.categories)
      ? (args.categories as unknown[]).map((c) => String(c))
      : [];
    const needles = [...kw, ...cats];
    const limit = Math.min(Math.max(Number(args.limit) || 3, 1), 6);

    let ranked = kb.courses
      .map((c) => ({
        c,
        s:
          scoreByText(`${c.title} ${c.summary}`, needles) +
          scoreByText(`${c.categoryLabel} ${c.category}`, [...cats, ...kw]) * 2,
      }))
      .sort((a, b) => b.s - a.s);
    if (needles.length && ranked.some((r) => r.s > 0)) {
      ranked = ranked.filter((r) => r.s > 0);
    }
    const picked = ranked.slice(0, limit).map((r) => r.c);

    const cards: AiCard[] = picked.map((c) => ({
      kind: "course",
      title: c.title,
      subtitle: `${c.categoryLabel} · ${c.summary}`.slice(0, 90),
      price: c.priceLabel,
      href: c.href,
    }));
    const model = picked.length
      ? `추천 강의 ${picked.length}건: ` +
        picked.map((c) => `${c.title}(${c.categoryLabel})`).join(", ")
      : "조건에 맞는 강의를 찾지 못함. 방문자에게 관심 분야를 한 번 더 물어볼 것.";
    return { model, cards };
  }

  if (name === "recommend_subscription") {
    const cards: AiCard[] = kb.programs.map((p) => ({
      kind: "program",
      title: p.name,
      subtitle: p.description,
      price: p.priceMonthly ? `월 ${p.priceMonthly.toLocaleString("ko-KR")}원` : "문의",
      href: p.href,
    }));
    const model = kb.programs.length
      ? `구독 프로그램 ${kb.programs.length}종 안내: ` +
        kb.programs.map((p) => p.name).join(", ")
      : "등록된 구독 프로그램이 없음.";
    return { model, cards };
  }

  if (name === "recommend_curator") {
    const kw = splitKeywords(typeof args.keywords === "string" ? args.keywords : "");
    const limit = Math.min(Math.max(Number(args.limit) || 2, 1), 4);
    let ranked = kb.curators
      .map((c) => ({ c, s: scoreByText(`${c.name} ${c.role}`, kw) }))
      .sort((a, b) => b.s - a.s);
    if (kw.length && ranked.some((r) => r.s > 0)) {
      ranked = ranked.filter((r) => r.s > 0);
    }
    const picked = ranked.slice(0, limit).map((r) => r.c);
    const cards: AiCard[] = picked.map((c) => ({
      kind: "curator",
      title: c.name,
      subtitle: c.role,
      href: c.href,
    }));
    const model = picked.length
      ? `소개할 큐레이터: ` + picked.map((c) => `${c.name}(${c.role})`).join(", ")
      : "조건에 맞는 큐레이터를 찾지 못함.";
    return { model, cards };
  }

  return { model: `알 수 없는 도구: ${name}`, cards: [] };
}
