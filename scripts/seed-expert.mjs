/**
 * klead.kr/33 전문가 과정 페이지 → DB 등록
 * 실행: npm run seed:expert
 */
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI 필요");
  process.exit(1);
}

const { Schema } = mongoose;

const Instructor =
  mongoose.models.Instructor ||
  mongoose.model(
    "Instructor",
    new Schema(
      {
        slug: { type: String, unique: true },
        name: String,
        title: String,
        bio: String,
        profileImage: String,
        specialties: [String],
        career: String,
        snsLinks: { instagram: String, youtube: String },
        sortOrder: Number,
        isPublished: Boolean,
        seo: { title: String, description: String, keywords: [String] },
      },
      { timestamps: true },
    ),
  );

const Content =
  mongoose.models.Content ||
  mongoose.model(
    "Content",
    new Schema(
      {
        slug: { type: String, unique: true },
        type: String,
        contentCategory: String,
        title: String,
        summary: String,
        body: String,
        thumbnail: String,
        sections: [Schema.Types.Mixed],
        relatedInstructorIds: [{ type: Schema.Types.ObjectId, ref: "Instructor" }],
        isPinned: Boolean,
        isPublic: Boolean,
        publish: {
          startDt: Date,
          endDt: Date,
          status: String,
        },
        priceDisplay: String,
        viewCount: Number,
        likeCount: Number,
        commentCount: Number,
        tagIds: [{ type: Schema.Types.ObjectId }],
        seo: Schema.Types.Mixed,
        createdBy: Schema.Types.ObjectId,
        updatedBy: Schema.Types.ObjectId,
      },
      { timestamps: true },
    ),
  );

const Menu =
  mongoose.models.Menu ||
  mongoose.model(
    "Menu",
    new Schema({
      parentId: Schema.Types.ObjectId,
      slug: { type: String, unique: true },
      name: String,
      path: String,
      linkType: String,
      depth: Number,
      sortOrder: Number,
      isVisible: Boolean,
    }),
  );

const MenuContent =
  mongoose.models.MenuContent ||
  mongoose.model(
    "MenuContent",
    new Schema({
      menuId: Schema.Types.ObjectId,
      contentId: Schema.Types.ObjectId,
      sortOrder: Number,
    }),
  );

const SiteSetting =
  mongoose.models.SiteSetting ||
  mongoose.model(
    "SiteSetting",
    new Schema({
      key: { type: String, unique: true },
      value: Schema.Types.Mixed,
      group: String,
      description: String,
    }),
  );

const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    new Schema({
      email: String,
      name: String,
      authProvider: String,
      authProviderId: String,
      role: String,
    }),
  );

const Tag =
  mongoose.models.Tag ||
  mongoose.model(
    "Tag",
    new Schema({
      name: String,
      slug: { type: String, unique: true },
      usageCount: Number,
    }),
  );

async function upsert(Model, filter, data) {
  return Model.findOneAndUpdate(filter, { $set: data }, {
    upsert: true,
    returnDocument: "after",
    setDefaultsOnInsert: true,
  });
}

async function main() {
  await mongoose.connect(MONGODB_URI, {
    dbName: "klead",
    serverSelectionTimeoutMS: 20000,
  });
  console.log("✓ MongoDB 연결\n");

  const admin = await User.findOne({ email: "admin@klead.test" });
  const now = new Date();

  // ─── Instructors: 김보령 보강 + 서현정 추가 ───────────
  const kim = await upsert(
    Instructor,
    { slug: "kim-boryeong" },
    {
      slug: "kim-boryeong",
      name: "김보령",
      title: "대표 / 테크 큐레이터",
      bio: "강의로서의 전문성과 현장 경쟁력을 책임지는 사람. 18년 경력의 전문 뷰티 마스터. 실무 + 교육학 + 강사 트레이닝 3박자를 갖춘 교육 전문가.",
      career:
        "뷰티 경력 18년차, 강사 경력 6년, 누적 배출 130명 / 건국대학교 교육대학원 미용학·미용교육 석사",
      specialties: ["왁싱", "페이스디자인", "경영", "강사양성"],
      profileImage:
        "https://cdn.imweb.me/thumbnail/20260219/7ef94542df7fe.png",
      sortOrder: 0,
      isPublished: true,
      seo: {
        title: "김보령 대표 | 클리드",
        description: "뷰티 경력 18년, 강사 경력 6년, 누적 배출 130명",
        keywords: ["김보령", "클리드", "강사양성"],
      },
    },
  );

  const seo = await upsert(
    Instructor,
    { slug: "seo-hyeonjeong" },
    {
      slug: "seo-hyeonjeong",
      name: "서현정",
      title: "대표 / 브랜딩·콘텐츠 디렉터",
      bio: "강의 기획력과 브랜딩·자료 설계를 책임지는 사람. 브랜드 기획, 콘텐츠 전략, 프레젠테이션 구조 설계 전문가.",
      career:
        "온라인 마케팅 운영 대행 10년 이상 / 브랜딩·디자인 전문 / 공공기관·대기업 PM 프로젝트 다수 수행",
      specialties: ["브랜딩", "콘텐츠전략", "PPT설계", "커리큘럼"],
      profileImage:
        "https://cdn.imweb.me/thumbnail/20260219/bef8bb57bcdf1.png",
      sortOrder: 1,
      isPublished: true,
      seo: {
        title: "서현정 대표 | 클리드",
        description: "브랜딩·디자인·콘텐츠 전략 전문가",
        keywords: ["서현정", "클리드", "브랜딩"],
      },
    },
  );
  console.log("✓ Instructors: 김보령, 서현정");

  // ─── Tags ────────────────────────────────────────────
  for (const name of ["전문가과정", "강사양성", "교육학", "커리큘럼", "브랜딩"]) {
    const slug = name;
    await upsert(Tag, { slug }, { name, slug, usageCount: 1 });
  }
  const tags = await Tag.find({
    slug: { $in: ["전문가과정", "강사양성", "교육학", "커리큘럼", "브랜딩"] },
  });

  // ─── SiteSettings (문의 채널 — /33 기준) ─────────────
  await upsert(
    SiteSetting,
    { key: "contact.email" },
    {
      key: "contact.email",
      value: "klead.official@gmail.com",
      group: "company",
      description: "파트너십/강의 문의 메일",
    },
  );
  await upsert(
    SiteSetting,
    { key: "sns.kakao" },
    {
      key: "sns.kakao",
      value: "https://pf.kakao.com/_Ptxign",
      group: "sns",
      description: "카카오채널 (전문가 과정 페이지 기준)",
    },
  );
  console.log("✓ SiteSettings contact/kakao 갱신");

  // ─── Expert Program Content ──────────────────────────
  const sections = [
    {
      key: "brand",
      title: "ABOUT KLEAD",
      subtitle: "클리드는\n기술자를 강사로 만들지 않고\n강사를 브랜드로 만듭니다.",
      body: "우리는 수강생을 가르치지 않습니다.\n우리는 함께 브랜드를 만듭니다.",
      items: [
        { title: "Knowledge", meta: { variant: "outline", x: 16, y: 36 }, sortOrder: 0 },
        { title: "Leadership", meta: { variant: "filled", x: 47, y: 23 }, sortOrder: 1 },
        { title: "Direction", meta: { variant: "outline", x: 82, y: 38 }, sortOrder: 2 },
        { title: "Aesthetic", meta: { variant: "filled", x: 15, y: 63 }, sortOrder: 3 },
        { title: "Enterpreneurship", meta: { variant: "outline", x: 62, y: 76 }, sortOrder: 4 },
        { title: "CLASS+", meta: { variant: "muted", x: 82, y: 63 }, sortOrder: 5 },
        { title: "CLASS+", meta: { variant: "muted", x: 16, y: 78 }, sortOrder: 6 },
      ],
      sortOrder: 0,
    },
    {
      key: "values",
      title: "클리드가 집중하는 핵심가치",
      body: "클리드는 단순히 기술을 배우는 곳이 아닙니다.\n배움 > 실전 > 브랜딩 > 창업 > 매출 > 확장까지\n끝까지 책임지는 성과 중심 아카데미 입니다.\n\n누구나 배울 수는 있지만,\n아무나 클리드가 될 수는 없습니다.",
      backgroundImage:
        "https://cdn.imweb.me/thumbnail/20260123/71698c2df52a9.jpg",
      items: [
        {
          title: "학습자 중심",
          description: "대상에 따라 다른 수업 커리큘럼으로 진행합니다.",
          iconUrl:
            "https://cdn.imweb.me/upload/S202312147f3235c86a141/1a0653b6e914c.png",
          sortOrder: 0,
        },
        {
          title: "실전 중심",
          description:
            "교육안, PPT, 수업, 실연까지 직접 수행하여 실전 위주로 진행합니다.",
          iconUrl:
            "https://cdn.imweb.me/upload/S202312147f3235c86a141/648ed3187834b.png",
          sortOrder: 1,
        },
        {
          title: "성과 기반",
          description:
            "완성된 강의안과 실연 능력으로 평가를 통해 완벽한 강사 자격을 갖춰드립니다.",
          iconUrl:
            "https://cdn.imweb.me/upload/S202312147f3235c86a141/f038166c695e6.png",
          sortOrder: 2,
        },
        {
          title: "상호작용 기반",
          description:
            "질문과 피드백 그리고 쪽집게 같은 코칭으로 상호작용 중심의 교육을 진행합니다.",
          iconUrl:
            "https://cdn.imweb.me/upload/S202312147f3235c86a141/86f3cef74aa17.png",
          sortOrder: 3,
        },
      ],
      sortOrder: 1,
    },
    {
      key: "leaders",
      title: "대표 소개",
      items: [
        {
          title: "김보령 대표",
          subtitle: "강의로서의 전문성과 현장 경쟁력을 책임지는 사람",
          description:
            "18년 경력의 전문 뷰티 마스터. 실무 + 교육학 + 강사 트레이닝 3박자를 갖춘 교육 전문가. 실제 업계에서 강사로 선택받는 법을 가장 잘 아는 사람. 강사 마인드셋, 업계 커뮤니케이션, 수업 운영법 전문 지도.",
          imageUrl:
            "https://cdn.imweb.me/thumbnail/20260219/7ef94542df7fe.png",
          bullets: [
            "뷰티 경력 18년차, 강사 경력 6년, 누적 배출 130명",
            "건국대학교 교육대학원 미용학·미용교육 석사",
          ],
          meta: { instructorSlug: "kim-boryeong" },
          sortOrder: 0,
        },
        {
          title: "서현정 대표",
          subtitle: "강의 기획력과 브랜딩 · 자료 설계를 책임지는 사람",
          description:
            "브랜드 기획, 콘텐츠 전략, 프레젠테이션 구조 설계 전문가. 수업 자료(PPT)·교재·커리큘럼을 체계적으로 만드는 능력 보유. 수업을 보는 순간 강사의 급이 보인다는 기준을 갖춘 디렉터.",
          imageUrl:
            "https://cdn.imweb.me/thumbnail/20260219/bef8bb57bcdf1.png",
          bullets: [
            "온라인 마케팅 운영 대행 10년 이상 경력",
            "브랜딩 · 디자인 전문 / 공공기관 · 대기업 PM 프로젝트 다수 수행",
          ],
          meta: { instructorSlug: "seo-hyeonjeong" },
          sortOrder: 1,
        },
      ],
      sortOrder: 2,
    },
    {
      key: "curriculum",
      title: "실전형 교육자 양성 프로그램",
      subtitle: "4단계 성장 구조",
      body: "클리드의 소속이 되는 순간\n누구도 범접할 수 없는 전문 강사가 됩니다.\n\n기술만 가르치지 않습니다.\n말 잘하는 법만 가르치지도 않습니다.\n\n전문성 + 커리큘럼 + 브랜딩 + 실전평가\n네가지를 모두 갖춘 사람만 강사라 부를 수 있습니다.",
      items: [
        {
          title: "01 교육학 기반 기초다지기",
          bullets: [
            "교육 목적 설정법",
            "학습자 유형 분석",
            "교수법 이론(모형 기반)",
            "교육 매체 선택",
          ],
          sortOrder: 0,
        },
        {
          title: "02 커리큘럼&교육안 PPT 설계",
          bullets: [
            "학습 목표(K-S-A) 설계",
            "강의 플로우 구성",
            "PPT 시각 설계",
            "실제 강의 1개 완성",
          ],
          sortOrder: 1,
        },
        {
          title: "03 실연수업 & 교수법 훈련",
          bullets: [
            "오프닝 스크립트",
            "전문용어 설명 방식",
            "사례&비유 활용",
            "학습자 참여 유도 기술",
          ],
          sortOrder: 2,
        },
        {
          title: "04 평가 & 강사 인증",
          bullets: [
            "진단&형성&총괄 평가 설계",
            "동료/멘토 피드백",
            "재설계 후 실연",
            "KLEAD 공식 강사 인증",
          ],
          sortOrder: 3,
        },
      ],
      sortOrder: 3,
    },
    {
      key: "partners",
      title: "클리드와 함께하는 파트너들",
      subtitle: "파트너사 현황",
      items: [
        {
          title: "partner-1",
          imageUrl:
            "https://cdn.imweb.me/upload/S20251222d59af4baed4e5/75bf01d316f8d.png",
          sortOrder: 0,
        },
        {
          title: "partner-2",
          imageUrl:
            "https://cdn.imweb.me/upload/S20251222d59af4baed4e5/48a72d6ba43bc.png",
          sortOrder: 1,
        },
        {
          title: "partner-3",
          imageUrl:
            "https://cdn.imweb.me/upload/S20251222d59af4baed4e5/5caff529c58cf.png",
          sortOrder: 2,
        },
        {
          title: "partner-4",
          imageUrl:
            "https://cdn.imweb.me/upload/S20251222d59af4baed4e5/3be24720aaf07.png",
          sortOrder: 3,
        },
        {
          title: "partner-5",
          imageUrl:
            "https://cdn.imweb.me/upload/S20251222d59af4baed4e5/5beb79970e7e7.png",
          sortOrder: 4,
        },
      ],
      sortOrder: 4,
    },
    {
      key: "contact",
      title: "Contact us.",
      items: [
        {
          title: "파트너쉽 / 강의 문의",
          description: "klead.official@gmail.com",
          linkUrl: "mailto:klead.official@gmail.com",
          linkLabel: "메일 보내기",
          sortOrder: 0,
        },
        {
          title: "인스타그램",
          description: "@klead_official",
          linkUrl: "https://www.instagram.com/klead_official",
          linkLabel: "인스타그램 방문하기",
          sortOrder: 1,
        },
        {
          title: "카톡채널 문의하기",
          description: "https://pf.kakao.com/_Ptxign",
          linkUrl: "https://pf.kakao.com/_Ptxign",
          linkLabel: "문의하기",
          sortOrder: 2,
        },
      ],
      sortOrder: 5,
    },
  ];

  const content = await upsert(
    Content,
    { slug: "expert-program" },
    {
      slug: "expert-program",
      type: "content",
      contentCategory: "expert_program",
      title: "전문가 과정 — 실전형 교육자 양성 프로그램",
      summary:
        "클리드는 기술자를 강사로 만들지 않고 강사를 브랜드로 만듭니다. 4단계 성장 구조의 실전형 교육자 양성 프로그램.",
      body: `<p>클리드는 기술자를 강사로 만들지 않고 강사를 브랜드로 만듭니다.</p>
<p>우리는 수강생을 가르치지 않습니다. 우리는 함께 브랜드를 만듭니다.</p>
<p>전문성 + 커리큘럼 + 브랜딩 + 실전평가 — 네가지를 모두 갖춘 사람만 강사라 부를 수 있습니다.</p>`,
      thumbnail:
        "https://cdn.imweb.me/thumbnail/20260123/f7a37966e1a46.png",
      sections,
      relatedInstructorIds: [kim._id, seo._id],
      isPinned: false,
      isPublic: true,
      publish: { status: "published", startDt: now },
      priceDisplay: "inquiry",
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      tagIds: tags.map((t) => t._id),
      seo: {
        title: "전문가 과정 | 클리드 실전형 교육자 양성",
        description:
          "4단계 성장 구조 — 교육학 기초, 커리큘럼·PPT 설계, 실연수업, KLEAD 공식 강사 인증",
        keywords: ["전문가과정", "강사양성", "클리드", "KLEAD"],
        ogImage:
          "https://cdn.imweb.me/thumbnail/20260123/f7a37966e1a46.png",
      },
      createdBy: admin?._id,
      updatedBy: admin?._id,
    },
  );
  console.log("✓ Content: expert-program");

  // ─── Menu 연결 ───────────────────────────────────────
  const expertMenu = await Menu.findOne({ slug: "expert" });
  if (expertMenu) {
    await MenuContent.findOneAndUpdate(
      { menuId: expertMenu._id, contentId: content._id },
      {
        $set: {
          menuId: expertMenu._id,
          contentId: content._id,
          sortOrder: 0,
        },
      },
      { upsert: true },
    );
    console.log("✓ MenuContents: expert → expert-program");
  } else {
    console.warn("! menus.expert 없음 — 메뉴 연결 스킵");
  }

  console.log("\n========== 전문가 과정 시드 완료 ==========");
  console.log("slug: expert-program");
  console.log("path: /expert (klead.kr/33 대응)");
  console.log("sections:", sections.map((s) => s.key).join(", "));

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
