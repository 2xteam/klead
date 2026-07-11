/**
 * 사이트 구조 시드: 큐레이터 7명(섹션 기반 Content) + 메뉴 트리 재정비.
 * 실행: npm run seed:structure
 * - 강의 종목만 하위 메뉴 유지, 나머지는 평면 메뉴
 * - 큐레이터는 Content(type=content, contentCategory=curator, slug=curator-*)
 */
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("MONGODB_URI 필요"); process.exit(1); }

const HERO = "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/hero-building.png";
const CUR = "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/curators";
const { Schema } = mongoose;

const Content = mongoose.models.Content || mongoose.model("Content", new Schema({
  slug: { type: String, unique: true }, type: String, contentCategory: String,
  title: String, summary: String, body: String, thumbnail: String,
  sections: [Schema.Types.Mixed], isPinned: Boolean, isPublic: Boolean,
  publish: { startDt: Date, endDt: Date, status: String },
  seo: { title: String, description: String, keywords: [String], ogImage: String },
  viewCount: Number, likeCount: Number, commentCount: Number, deletedAt: Date,
}, { timestamps: true }));

const Menu = mongoose.models.Menu || mongoose.model("Menu", new Schema({
  parentId: { type: Schema.Types.ObjectId, ref: "Menu" },
  slug: { type: String, unique: true }, name: String, path: String,
  linkType: String, externalUrl: String, depth: Number, sortOrder: Number,
  isVisible: Boolean, icon: String, badge: String,
}, { timestamps: true }));

const MenuContent = mongoose.models.MenuContent || mongoose.model("MenuContent", new Schema({
  menuId: { type: Schema.Types.ObjectId, ref: "Menu" },
  contentId: { type: Schema.Types.ObjectId, ref: "Content" }, sortOrder: Number,
}, { timestamps: { createdAt: true, updatedAt: false } }));

const published = { status: "published", startDt: new Date("2026-01-01T00:00:00Z") };

function profileHeader(name, title) {
  return {
    key: "header", type: "profileHeader", theme: "dark",
    title: name, subtitle: "TECH CURATOR", body: title,
    backgroundImage: HERO, sortOrder: 0,
  };
}

const curators = [
  {
    slug: "curator-kim-boryeong", name: "김보령", role: "클리드 대표",
    sections: [
      profileHeader("김보령", "클리드 대표 · 뷰티샵 출장 컨설팅 전문 원장"),
      { key: "intro", type: "richText", theme: "light", title: "소개", lazy: true,
        body: "샵 운영 구조와 매출 흐름을 현장 경험 바탕으로, 상담·메뉴·가격·재방문까지 전 과정을 재설계하는 뷰티샵 출장 컨설팅 전문 원장입니다.", sortOrder: 1 },
      { key: "career", type: "imageText", theme: "light", title: "경력", imagePosition: "left", lazy: true,
        imageUrl: HERO, sortOrder: 2,
        items: ["클리드 대표","클뷰티 대표원장","캐론랩 정식 교육기관","대한 메디컬 뷰티 협회 이사","화장품 뷰티 학회 이사","한국 인체 미용 예술 학회 정회원","K뷰티연합회 지회장","국제표준뷰티융합총연합회 IBS 지회장"].map((t,i)=>({title:t,sortOrder:i})) },
      { key: "awards", type: "imageText", theme: "dark", title: "자격 & 수상", imagePosition: "right", lazy: true,
        imageUrl: HERO, sortOrder: 3,
        items: ["창업 상권 분석 지도자 1급","뷰티일러스트 3급","스피치 지도사 1급","산후관리사 1급","왁싱코디네이터 1급","국회의원 이언주 표창장 수상","국제 바디 콘테스트 왁싱 총괄 운영위원장","국제뷰티마스터 콘테스트 멘토그랑프리 수상"].map((t,i)=>({title:t,sortOrder:i})) },
    ],
  },
  { slug: "curator-kim-yujeong", name: "김유정", role: "클레마르 헤드스파 원장" },
  { slug: "curator-shin-semi", name: "신세미", role: "유얼뷰티 대표원장" },
  { slug: "curator-moon-seolhui", name: "문설희", role: "설리아 대표원장" },
  { slug: "curator-lee-hayan", name: "이하얀", role: "뷰티인하얀 대표원장" },
  { slug: "curator-jo-euna", name: "조은아", role: "비쥬왁싱 대표원장" },
  { slug: "curator-chae-hansol", name: "채한솔", role: "아르니왁싱 대표원장" },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB 연결됨");

  // 1) 큐레이터 콘텐츠
  for (const [i, c] of curators.entries()) {
    const sections = c.sections ?? [
      profileHeader(c.name, c.role),
      { key: "intro", type: "richText", theme: "light", title: "소개", lazy: true,
        body: `${c.role}. 상세 소개 콘텐츠는 관리자에서 구역을 추가해 작성할 수 있습니다.`, sortOrder: 1 },
    ];
    const img = `${CUR}/${c.slug}.png`;
    if (sections[0]?.key === "header") sections[0].imageUrl = img;
    await Content.findOneAndUpdate({ slug: c.slug }, {
      slug: c.slug, type: "content", contentCategory: "curator",
      title: c.name, summary: c.role, body: "",
      thumbnail: img, sections,
      isPinned: false, isPublic: true, publish: published,
      viewCount: 0, likeCount: 0, commentCount: 0,
      seo: { title: `${c.name} | 클리드 테크 큐레이터`, description: c.role },
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`  curator: ${c.name} (${c.role}) sections=${sections.length}`);
  }

  // 2) 메뉴 트리 재정비
  await Menu.deleteMany({});
  await MenuContent.deleteMany({});
  const top = [
    { slug: "m-about", name: "클리드", path: "/about", sortOrder: 0 },
    { slug: "m-curators", name: "테크 큐레이터", path: "/curators", sortOrder: 1 },
    { slug: "m-expert", name: "전문가 과정", path: "/expert", sortOrder: 2 },
    { slug: "m-courses", name: "강의 종목", path: "/courses", sortOrder: 3 },
  ];
  const idBySlug = {};
  for (const m of top) {
    const doc = await Menu.create({ ...m, linkType: "internal", depth: 0, isVisible: true });
    idBySlug[m.slug] = doc._id;
  }
  // 강의 종목만 하위 메뉴
  const subs = [
    { slug: "m-course-waxing", name: "왁싱", path: "/courses/waxing", sortOrder: 0 },
    { slug: "m-course-scalp", name: "두피관리", path: "/courses/scalp", sortOrder: 1 },
    { slug: "m-course-theory", name: "이론", path: "/courses/theory", sortOrder: 2 },
    { slug: "m-course-business", name: "경영", path: "/courses/business", sortOrder: 3 },
    { slug: "m-course-skincare", name: "피부관리", path: "/courses/skin-care", sortOrder: 4 },
  ];
  for (const s of subs) {
    await Menu.create({ ...s, parentId: idBySlug["m-courses"], linkType: "internal", depth: 1, isVisible: true });
  }
  console.log(`  menus: 최상위 ${top.length}, 강의종목 하위 ${subs.length}`);

  // 3) 샘플 게시글(공지) — 게시글 관리에 데이터
  const notices = [
    { slug: "notice-open", title: "클리드 온라인 강의 플랫폼 오픈 안내", cat: "notice", summary: "구독형 LMS가 오픈되었습니다.", body: "<p>프로그램별 권한에 따라 강의를 수강하실 수 있습니다.</p>", pinned: true },
    { slug: "notice-earlybird", title: "얼리버드 할인 안내", cat: "event", summary: "얼리버드 할인 마감 임박!", body: "<p>기회를 놓치지 마세요.</p>", pinned: false },
    { slug: "guide-howto", title: "수강 신청 방법 안내", cat: "guide", summary: "카카오채널로 문의 후 등록", body: "<p>카카오채널 '클리드'로 문의 주세요.</p>", pinned: false },
  ];
  for (const [i, n] of notices.entries()) {
    await Content.findOneAndUpdate({ slug: n.slug }, {
      slug: n.slug, type: "content", contentCategory: n.cat,
      title: n.title, summary: n.summary, body: n.body,
      isPinned: n.pinned, isPublic: true, publish: published,
      viewCount: 0, likeCount: 0, commentCount: 0,
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`  notice: ${n.title}`);
  }

  await mongoose.disconnect();
  console.log("완료.");
}
main().catch((e) => { console.error(e); process.exit(1); });
