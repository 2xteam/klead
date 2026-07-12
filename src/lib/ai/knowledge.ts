/**
 * KLEAD AI 상담사용 지식베이스.
 * 큐레이터·강의·구독 프로그램을 DB에서 한 번 조회해 캐시하고,
 * (1) RAG 프롬프트 텍스트와 (2) 도구(tools)가 쓸 구조화 데이터를 함께 제공한다.
 * "초기에 조회해서 RAG 문서에 추가"하는 방식.
 */
import connectDB from "@/lib/db/mongodb";
import { Content, Program } from "@/lib/db/models";

export interface CuratorInfo {
  slug: string;
  name: string;
  role: string;
  href: string;
}

export interface CourseInfo {
  slug: string;
  title: string;
  summary: string;
  category: string;
  categoryLabel: string;
  priceLabel: string;
  href: string;
}

export interface ProgramInfo {
  code: string;
  name: string;
  description: string;
  priceMonthly?: number;
  href: string;
}

export interface KleadKnowledge {
  curators: CuratorInfo[];
  courses: CourseInfo[];
  programs: ProgramInfo[];
  ragText: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  waxing: "왁싱",
  eyebrow: "눈썹",
  scalp: "두피관리",
  face_design: "페이스디자인",
  skin_care: "피부관리",
  body_care: "바디관리",
  theory: "이론",
  business: "경영",
};

function priceLabel(display?: string, amount?: number): string {
  if (display === "free") return "무료";
  if (display === "amount" && amount) return `${amount.toLocaleString("ko-KR")}원`;
  return "가격문의";
}

let cache: { data: KleadKnowledge; at: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

/** 큐레이터·강의·구독권을 조회해 캐시(5분) 후 반환한다. */
export async function loadKleadKnowledge(): Promise<KleadKnowledge> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  await connectDB();
  const [curatorDocs, lectureDocs, programDocs] = await Promise.all([
    Content.find({ contentCategory: "curator", "publish.status": "published", deletedAt: null })
      .select("slug title summary")
      .lean(),
    Content.find({ type: "lecture", deletedAt: null })
      .select("slug title summary lectureCategory priceDisplay priceAmount aiSummary")
      .lean(),
    Program.find({ isActive: true }).select("code name description priceMonthly").lean(),
  ]);

  const curators: CuratorInfo[] = curatorDocs.map((d) => ({
    slug: d.slug,
    name: d.title,
    role: d.summary ?? "",
    href: `/${d.slug}`,
  }));

  const courses: CourseInfo[] = lectureDocs.map((d) => {
    const cat = d.lectureCategory ?? "";
    return {
      slug: d.slug,
      title: d.title,
      summary:
        (d as { aiSummary?: string }).aiSummary?.trim() || d.summary?.trim() || "",
      category: cat,
      categoryLabel: CATEGORY_LABEL[cat] ?? cat,
      priceLabel: priceLabel(d.priceDisplay, d.priceAmount),
      href: `/${d.slug}`,
    };
  });

  const programs: ProgramInfo[] = programDocs.map((d) => ({
    code: d.code,
    name: d.name,
    description: d.description ?? "",
    priceMonthly: d.priceMonthly,
    href: `/${d.code}`,
  }));

  const ragText = buildRagText(curators, courses, programs);
  const data: KleadKnowledge = { curators, courses, programs, ragText };
  cache = { data, at: Date.now() };
  return data;
}

function buildRagText(
  curators: CuratorInfo[],
  courses: CourseInfo[],
  programs: ProgramInfo[],
): string {
  const byCat = new Map<string, CourseInfo[]>();
  for (const c of courses) {
    const list = byCat.get(c.categoryLabel) ?? [];
    list.push(c);
    byCat.set(c.categoryLabel, list);
  }

  const courseLines = [...byCat.entries()]
    .map(([label, list]) => {
      const items = list
        .map((c) => `  · ${c.title} (${c.priceLabel}) — ${c.summary} → 링크: ${c.href}`)
        .join("\n");
      return `[${label}]\n${items}`;
    })
    .join("\n");

  const curatorLines = curators
    .map((c) => `  · ${c.name} — ${c.role} → 링크: ${c.href}`)
    .join("\n");

  const programLines = programs
    .map(
      (p) =>
        `  · ${p.name} — 월 ${
          p.priceMonthly ? p.priceMonthly.toLocaleString("ko-KR") + "원" : "문의"
        } — ${p.description} → 링크: ${p.href}`,
    )
    .join("\n");

  return [
    "──── KLEAD 지식베이스 (실시간 조회) ────",
    "",
    "■ 테크 큐레이터(전문 강사진)",
    curatorLines || "  (등록된 큐레이터 없음)",
    "",
    "■ 강의 종목 (카테고리별)",
    courseLines || "  (등록된 강의 없음)",
    "",
    "■ 구독 프로그램(정기권)",
    programLines || "  (등록된 프로그램 없음)",
    "",
    "본문에 링크를 넣을 때는 위 「링크:」에 적힌 경로(예: /kim-boryeong, /waxing-basic-01, /basic)를 그대로 사용한다.",
    "목록에 없는 강의·큐레이터·프로그램이나 임의의 URL을 지어내지 않는다. 도구 호출 시에도 위 이름/카테고리를 근거로 한다.",
  ].join("\n");
}
