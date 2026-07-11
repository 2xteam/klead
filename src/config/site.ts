export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  {
    label: "클리드",
    href: "/about",
  },
  {
    label: "테크 큐레이터",
    href: "/curators",
  },
  {
    label: "전문가 과정",
    href: "/expert",
  },
  {
    label: "강의 종목",
    href: "/courses",
    children: [
      { label: "왁싱", href: "/courses?category=waxing" },
      { label: "두피관리", href: "/courses?category=scalp" },
      { label: "이론", href: "/courses?category=theory" },
      { label: "경영", href: "/courses?category=business" },
      { label: "피부관리", href: "/courses?category=skin_care" },
    ],
  },
];

export const footerCourseLinks = [
  { label: "왁싱", href: "/courses?category=waxing" },
  { label: "두피관리", href: "/courses?category=scalp" },
  { label: "피부관리", href: "/courses?category=skin_care" },
  { label: "바디관리", href: "/courses?category=body_care" },
  { label: "이론", href: "/courses?category=theory" },
  { label: "경영", href: "/courses?category=business" },
];

export const footerPageLinks = [
  { label: "강의 후기", href: "/review" },
  { label: "강의 Q&A", href: "/qna" },
  { label: "커뮤니티", href: "/community" },
];

const R2 = "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets";

/** 페이지 상단 헤로 자산 */
export const pageHero = {
  building: `${R2}/hero-building.png`, // 클리드/큐레이터 상단 배너
  logoWhite: `${R2}/logo-white.png`, // 어두운 배경용
  logoDark: `${R2}/logo-dark.png`, // 밝은 배경용
};

/** 파트너사 로고 */
export const partners = [
  { name: "klebeauty", image: `${R2}/partner-klebeauty.png` },
  { name: "UR BEAUTY", image: `${R2}/partner-urbeauty.png` },
  { name: "UZULIKE", image: `${R2}/partner-uzulike.png` },
  { name: "KOREA BEAUTY MEDICAL ASSOCIATION", image: `${R2}/partner-kbma.png` },
  { name: "KLEMARE", image: `${R2}/partner-klemare.png` },
];

export const brandAssets = {
  logo: {
    default:
      "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/ff28bbe70a495.png",
    scroll:
      "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/d1b918365b0c0.png",
    mobile:
      "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/76acd670952f5.png",
  },
  valueCards: {
    learner: {
      title: "학습자 중심",
      description: "대상에 따라\n다른 수업 커리큘럼",
      href: "/about#learner",
      bgImage:
        "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/ac5803b3df8bb.png",
      icon: "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/4abae145f6481.png",
    },
    practice: {
      title: "실전 중심",
      description: "교육안 · PPT · 수업 · 실연까지\n직접 수행",
      href: "/about#practice",
      icon: "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/64df6505ee52c.png",
    },
    interaction: {
      title: "상호작용 기반",
      description: "질문 · 피드백 · 코칭\n중심 교육",
      href: "/about#interaction",
      icon: "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/5c3f46f7027c0.png",
    },
    result: {
      title: "성과 기반",
      description: "완성된 강의안과\n실연 능력으로 평가",
      href: "/about#result",
      icon: "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/bdd5bf2a2eb39.png",
    },
  },
  ctaBanner: {
    image: "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/7614a5ff9f642.jpg",
    title: "클리드의 소속이 되는 순간",
    subtitle: "누구도 범접할 수 없는 전문 강사가 됩니다.",
    body: ["기술만 가르치지 않습니다.", "말 잘하는 법만 가르치지도 않습니다."],
    highlight: "전문성 + 커리큘럼 + 브랜딩 + 실전 평가",
    highlightSub: "이 네 가지를 모두 갖춘 사람만 강사라 부를 수 있습니다.",
    href: "/community",
    buttonLabel: "바로 알아보기",
  },
  featuredCourses: [
    {
      title: "뷰티샵 출장 컨설팅 원데이 심화 과정",
      priceLabel: "가격문의",
      image:
        "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/650b6f8380154.png",
      href: "/courses/consulting-oneday",
    },
    {
      title: "페이스 디자인 투데이 실습과정",
      priceLabel: "가격문의",
      image:
        "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/c2f06e1d1699c.png",
      href: "/courses/face-design-today",
    },
    {
      title: "두피관리 원데이 실습과정",
      priceLabel: "가격문의",
      image:
        "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/52819a4c001ec.png",
      href: "/courses/scalp-oneday",
    },
  ],
  sns: {
    instagram: "https://www.instagram.com/klead_official",
    youtube: "https://www.youtube.com/@klead_official",
    kakao: "https://pf.kakao.com/_Ptxign",
    email: "klead.official@gmail.com",
  },
};
