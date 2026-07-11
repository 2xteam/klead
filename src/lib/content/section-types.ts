/**
 * 섹션 타입 상수 — 클라이언트/서버 공용 (mongoose 비의존).
 * DB 스키마(common.ts)와 콘텐츠 빌더(client)가 함께 사용한다.
 */
export const SECTION_TYPES = [
  "hero",
  "richText",
  "image",
  "imageText",
  "gallery",
  "cards",
  "steps",
  "profileHeader",
  "partners",
  "contact",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "히어로 (제목+배경)",
  richText: "텍스트 (제목+본문)",
  image: "단일 이미지",
  imageText: "이미지+텍스트",
  gallery: "갤러리 (이미지 그리드)",
  cards: "카드 그리드",
  steps: "번호형 단계 카드",
  profileHeader: "프로필 헤더",
  partners: "파트너 로고",
  contact: "연락처",
};
