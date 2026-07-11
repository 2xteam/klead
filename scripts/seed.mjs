/**
 * KLEAD 전체 스키마 인덱스 생성 + 기본/테스트 데이터 시드
 * 실행: npm run seed
 */
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI가 필요합니다.");
  process.exit(1);
}

const { Schema, Types } = mongoose;

// ─── Schemas ───────────────────────────────────────────
const UserSchema = new Schema({
  email: String,
  name: { type: String, required: true },
  nickname: String,
  profileImage: String,
  phone: String,
  authProvider: { type: String, enum: ["kakao", "test"], required: true },
  authProviderId: { type: String, required: true },
  role: { type: String, enum: ["member", "admin"], default: "member" },
  status: { type: String, enum: ["active", "suspended", "withdrawn"], default: "active" },
  notificationPrefs: {
    notice: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    qnaReply: { type: Boolean, default: true },
  },
  lastLoginAt: Date,
}, { timestamps: true });
UserSchema.index({ authProvider: 1, authProviderId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { sparse: true, unique: true });
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const Instructor = mongoose.models.Instructor || mongoose.model("Instructor", new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: String,
  bio: { type: String, default: "" },
  profileImage: String,
  specialties: [String],
  career: String,
  snsLinks: { instagram: String, youtube: String },
  sortOrder: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  seo: { title: String, description: String, keywords: [String] },
}, { timestamps: true }));

const Program = mongoose.models.Program || mongoose.model("Program", new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  priceMonthly: Number,
  priceYearly: Number,
}, { timestamps: true }));

const PermissionType = mongoose.models.PermissionType || mongoose.model("PermissionType", new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ["basic", "master", "expert"] },
  description: String,
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true }));

const ProgramPermissionSchema = new Schema({
  programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
  permissionTypeId: { type: Schema.Types.ObjectId, ref: "PermissionType", required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
ProgramPermissionSchema.index({ programId: 1, permissionTypeId: 1 }, { unique: true });
const ProgramPermission = mongoose.models.ProgramPermission || mongoose.model("ProgramPermission", ProgramPermissionSchema);

const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
  status: { type: String, enum: ["active", "expired", "cancelled", "pending"], default: "active" },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  autoRenew: { type: Boolean, default: false },
  grantedBy: { type: Schema.Types.ObjectId, ref: "User" },
  note: String,
}, { timestamps: true }));

const UserPermission = mongoose.models.UserPermission || mongoose.model("UserPermission", new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  permissionTypeId: { type: Schema.Types.ObjectId, ref: "PermissionType", required: true },
  source: { type: String, enum: ["manual", "subscription", "promotion"], default: "manual" },
  sourceId: Schema.Types.ObjectId,
  startAt: Date,
  endAt: Date,
  grantedBy: { type: Schema.Types.ObjectId, ref: "User" },
  note: String,
}, { timestamps: true }));

const Menu = mongoose.models.Menu || mongoose.model("Menu", new Schema({
  parentId: { type: Schema.Types.ObjectId, ref: "Menu" },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  path: String,
  linkType: { type: String, enum: ["internal", "external", "folder"], default: "internal" },
  externalUrl: String,
  depth: { type: Number, default: 0 },
  sortOrder: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
  icon: String,
  badge: String,
}, { timestamps: true }));

const MenuContentSchema = new Schema({
  menuId: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
  contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } });
MenuContentSchema.index({ menuId: 1, contentId: 1 }, { unique: true });
const MenuContent = mongoose.models.MenuContent || mongoose.model("MenuContent", MenuContentSchema);

const Content = mongoose.models.Content || mongoose.model("Content", new Schema({
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ["content", "lecture"], required: true },
  contentCategory: String,
  lectureCategory: String,
  title: { type: String, required: true },
  summary: String,
  body: { type: String, default: "" },
  thumbnail: String,
  videoId: String,
  videoDuration: Number,
  videoStatus: { type: String, enum: ["processing", "ready", "error"] },
  instructorId: { type: Schema.Types.ObjectId, ref: "Instructor" },
  lectureMode: { type: String, enum: ["online", "offline", "hybrid"] },
  isPinned: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  publish: {
    startDt: Date,
    endDt: Date,
    status: { type: String, enum: ["draft", "scheduled", "published", "expired"], default: "draft" },
  },
  priceDisplay: { type: String, enum: ["inquiry", "free", "amount"], default: "inquiry" },
  priceAmount: Number,
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  tagIds: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  seo: { title: String, description: String, keywords: [String] },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  deletedAt: Date,
}, { timestamps: true }));

const ContentPermissionSchema = new Schema({
  contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
  permissionTypeId: { type: Schema.Types.ObjectId, ref: "PermissionType", required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
ContentPermissionSchema.index({ contentId: 1, permissionTypeId: 1 }, { unique: true });
const ContentPermission = mongoose.models.ContentPermission || mongoose.model("ContentPermission", ContentPermissionSchema);

const Comment = mongoose.models.Comment || mongoose.model("Comment", new Schema({
  contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
  body: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true }));

const LikeSchema = new Schema({
  contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
LikeSchema.index({ contentId: 1, userId: 1 }, { unique: true });
const Like = mongoose.models.Like || mongoose.model("Like", LikeSchema);

const ReviewSchema = new Schema({
  contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  body: { type: String, required: true },
  images: [String],
  isVisible: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });
ReviewSchema.index({ contentId: 1, userId: 1 }, { unique: true });
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

const Faq = mongoose.models.Faq || mongoose.model("Faq", new Schema({
  category: String,
  question: { type: String, required: true },
  answer: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true }));

const QnA = mongoose.models.QnA || mongoose.model("QnA", new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  contentId: { type: Schema.Types.ObjectId, ref: "Content" },
  category: String,
  title: { type: String, required: true },
  body: { type: String, required: true },
  status: { type: String, enum: ["pending", "answered", "closed"], default: "pending" },
  isPrivate: { type: Boolean, default: false },
  answer: {
    body: String,
    answeredBy: { type: Schema.Types.ObjectId, ref: "User" },
    answeredAt: Date,
  },
}, { timestamps: true }));

const Tag = mongoose.models.Tag || mongoose.model("Tag", new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } }));

const Popup = mongoose.models.Popup || mongoose.model("Popup", new Schema({
  title: { type: String, required: true },
  body: String,
  imageUrl: String,
  linkUrl: String,
  linkTarget: { type: String, enum: ["_self", "_blank"], default: "_self" },
  display: {
    startDt: { type: Date, required: true },
    endDt: { type: Date, required: true },
    showOnce: { type: Boolean, default: true },
    pages: [String],
  },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true }));

const SiteSetting = mongoose.models.SiteSetting || mongoose.model("SiteSetting", new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  group: { type: String, enum: ["general", "header", "footer", "sns", "seo", "company"], default: "general" },
  description: String,
}, { timestamps: { createdAt: false, updatedAt: true } }));

async function upsert(Model, filter, data) {
  return Model.findOneAndUpdate(filter, { $set: data }, {
    upsert: true,
    returnDocument: "after",
    setDefaultsOnInsert: true,
  });
}

async function seed() {
  await mongoose.connect(MONGODB_URI, {
    dbName: "klead",
    serverSelectionTimeoutMS: 20000,
  });
  console.log("✓ MongoDB 연결 (klead)\n");

  // 인덱스 동기화 (기존 충돌 인덱스 정리 후)
  try {
    await mongoose.connection.collection("users").dropIndex("email_1");
  } catch {
    // 없으면 무시
  }

  const models = [
    User, Instructor, Program, PermissionType, ProgramPermission,
    Subscription, UserPermission, Menu, MenuContent, Content,
    ContentPermission, Comment, Like, Review, Faq, QnA, Tag, Popup, SiteSetting,
  ];
  for (const m of models) {
    try {
      await m.syncIndexes();
    } catch (err) {
      console.warn(`  인덱스 경고 (${m.modelName}):`, err.message);
    }
  }
  console.log("✓ 인덱스 동기화 완료\n");

  // ─── SiteSettings ────────────────────────────────────
  const settings = [
    { key: "theme.primaryColor", value: "#7407ff", group: "general", description: "브랜드 메인 컬러" },
    { key: "header.logo", value: {
      default: "https://cdn.imweb.me/thumbnail/20260710/ff28bbe70a495.png",
      scroll: "https://cdn.imweb.me/thumbnail/20260710/d1b918365b0c0.png",
      mobile: "https://cdn.imweb.me/thumbnail/20260710/76acd670952f5.png",
    }, group: "header" },
    { key: "header.height", value: 70, group: "header" },
    { key: "main.banner", value: {
      images: ["https://cdn.imweb.me/thumbnail/20260203/7614a5ff9f642.jpg"],
      autoplay: true,
    }, group: "general" },
    { key: "sns.instagram", value: "https://www.instagram.com/klead_official", group: "sns" },
    { key: "sns.youtube", value: "https://www.youtube.com/@klead_official", group: "sns" },
    { key: "sns.kakao", value: "https://pf.kakao.com/_klead", group: "sns" },
    { key: "company.info", value: {
      name: "클리드 : KLEAD",
      ceo: "김보령",
      email: "queenseohj891121@gmail.com",
    }, group: "company" },
    { key: "home.instagramFeed", value: { enabled: true, username: "klead_official", postLimit: 6 }, group: "general" },
    { key: "seo.default", value: {
      title: "클리드 : 뷰티양성교육기관",
      description: "Beauty Mastery Academy",
      keywords: ["클리드", "뷰티양성교육기관"],
    }, group: "seo" },
  ];
  for (const s of settings) {
    await upsert(SiteSetting, { key: s.key }, s);
  }
  console.log(`✓ SiteSettings ${settings.length}건`);

  // ─── PermissionTypes ─────────────────────────────────
  const permissionDefs = [
    { code: "Waxing_Basic", name: "왁싱 입문", category: "Waxing", level: "basic", sortOrder: 10 },
    { code: "Waxing_Master", name: "왁싱 전문가", category: "Waxing", level: "master", sortOrder: 11 },
    { code: "Eyebrow_Basic", name: "눈썹 입문", category: "Eyebrow", level: "basic", sortOrder: 20 },
    { code: "Eyebrow_Master", name: "눈썹 전문가", category: "Eyebrow", level: "master", sortOrder: 21 },
    { code: "Scalp_Basic", name: "두피관리 입문", category: "Scalp", level: "basic", sortOrder: 30 },
    { code: "Scalp_Master", name: "두피관리 전문가", category: "Scalp", level: "master", sortOrder: 31 },
    { code: "FaceDesign_Basic", name: "페이스디자인 입문", category: "FaceDesign", level: "basic", sortOrder: 40 },
    { code: "FaceDesign_Master", name: "페이스디자인 전문가", category: "FaceDesign", level: "master", sortOrder: 41 },
    { code: "SkinCare_Basic", name: "피부관리 입문", category: "SkinCare", level: "basic", sortOrder: 50 },
    { code: "SkinCare_Master", name: "피부관리 전문가", category: "SkinCare", level: "master", sortOrder: 51 },
    { code: "BodyCare_Basic", name: "바디관리 입문", category: "BodyCare", level: "basic", sortOrder: 60 },
    { code: "Theory_Basic", name: "이론 입문", category: "Theory", level: "basic", sortOrder: 70 },
    { code: "Business_Basic", name: "경영 입문", category: "Business", level: "basic", sortOrder: 80 },
    { code: "Business_Master", name: "경영 전문가", category: "Business", level: "master", sortOrder: 81 },
  ];
  const permMap = {};
  for (const p of permissionDefs) {
    const doc = await upsert(PermissionType, { code: p.code }, { ...p, isActive: true });
    permMap[p.code] = doc._id;
  }
  console.log(`✓ PermissionTypes ${permissionDefs.length}건`);

  // ─── Programs ────────────────────────────────────────
  const programDefs = [
    { code: "basic", name: "Basic", description: "입문 과정 접근", sortOrder: 0, priceMonthly: 99000 },
    { code: "premium", name: "Premium", description: "입문+심화 과정 접근", sortOrder: 1, priceMonthly: 199000 },
    { code: "master", name: "Master", description: "전체 과정 무제한 접근", sortOrder: 2, priceMonthly: 299000 },
  ];
  const programMap = {};
  for (const p of programDefs) {
    const doc = await upsert(Program, { code: p.code }, { ...p, isActive: true });
    programMap[p.code] = doc._id;
  }
  console.log(`✓ Programs ${programDefs.length}건`);

  // ProgramPermissions
  const basicPerms = [
    "Waxing_Basic", "Eyebrow_Basic", "Scalp_Basic", "FaceDesign_Basic",
    "SkinCare_Basic", "BodyCare_Basic", "Theory_Basic", "Business_Basic",
  ];
  const premiumPerms = [
    ...basicPerms,
    "Waxing_Master", "Eyebrow_Master", "Scalp_Master", "FaceDesign_Master", "SkinCare_Master",
  ];
  const masterPerms = permissionDefs.map((p) => p.code);

  const programPermSets = {
    basic: basicPerms,
    premium: premiumPerms,
    master: masterPerms,
  };

  await ProgramPermission.deleteMany({});
  let ppCount = 0;
  for (const [code, codes] of Object.entries(programPermSets)) {
    for (const permCode of codes) {
      await ProgramPermission.create({
        programId: programMap[code],
        permissionTypeId: permMap[permCode],
      });
      ppCount++;
    }
  }
  console.log(`✓ ProgramPermissions ${ppCount}건`);

  // ─── Instructors ─────────────────────────────────────
  const instructors = [
    { slug: "kim-boryeong", name: "김보령", title: "대표 / 테크 큐레이터", specialties: ["왁싱", "페이스디자인", "경영"], bio: "클리드 대표. 실전형 교육자 양성 과정을 설계합니다.", sortOrder: 0 },
    { slug: "kim-yujeong", name: "김유정", title: "테크 큐레이터", specialties: ["두피관리", "피부관리"], bio: "두피·피부 관리 실무 교육 담당.", sortOrder: 1 },
    { slug: "shin-semi", name: "신세미", title: "테크 큐레이터", specialties: ["왁싱", "눈썹"], bio: "왁싱·눈썹 디자인 실전 교육 담당.", sortOrder: 2 },
    { slug: "moon-seolhui", name: "문설희", title: "테크 큐레이터", specialties: ["이론", "경영"], bio: "이론·창업 경영 교육 담당.", sortOrder: 3 },
  ];
  const instructorMap = {};
  for (const i of instructors) {
    const doc = await upsert(Instructor, { slug: i.slug }, { ...i, isPublished: true });
    instructorMap[i.slug] = doc._id;
  }
  console.log(`✓ Instructors ${instructors.length}건`);

  // ─── Menus ───────────────────────────────────────────
  const rootMenus = [
    { slug: "about", name: "클리드", path: "/about", depth: 0, sortOrder: 0 },
    { slug: "curators", name: "테크 큐레이터", path: "/curators", depth: 0, sortOrder: 1, linkType: "folder" },
    { slug: "expert", name: "전문가 과정", path: "/expert", depth: 0, sortOrder: 2 },
    { slug: "courses", name: "강의 종목", path: "/courses", depth: 0, sortOrder: 3, linkType: "folder" },
    { slug: "community", name: "커뮤니티", path: "/community", depth: 0, sortOrder: 4 },
    { slug: "review", name: "강의 후기", path: "/review", depth: 0, sortOrder: 5 },
    { slug: "qna", name: "강의 Q&A", path: "/qna", depth: 0, sortOrder: 6 },
    { slug: "faq", name: "FAQ", path: "/faq", depth: 0, sortOrder: 7 },
  ];
  const menuMap = {};
  for (const m of rootMenus) {
    const doc = await upsert(Menu, { slug: m.slug }, { ...m, isVisible: true, linkType: m.linkType || "internal" });
    menuMap[m.slug] = doc._id;
  }

  const childMenus = [
    { parent: "curators", slug: "curator-kim-boryeong", name: "김보령", path: "/curators/kim-boryeong", sortOrder: 0 },
    { parent: "curators", slug: "curator-kim-yujeong", name: "김유정", path: "/curators/kim-yujeong", sortOrder: 1 },
    { parent: "curators", slug: "curator-shin-semi", name: "신세미", path: "/curators/shin-semi", sortOrder: 2 },
    { parent: "curators", slug: "curator-moon-seolhui", name: "문설희", path: "/curators/moon-seolhui", sortOrder: 3 },
    { parent: "courses", slug: "course-waxing", name: "왁싱", path: "/courses/waxing", sortOrder: 0 },
    { parent: "courses", slug: "course-scalp", name: "두피관리", path: "/courses/scalp", sortOrder: 1 },
    { parent: "courses", slug: "course-eyebrow", name: "눈썹", path: "/courses/eyebrow", sortOrder: 2 },
    { parent: "courses", slug: "course-face-design", name: "페이스디자인", path: "/courses/face-design", sortOrder: 3 },
    { parent: "courses", slug: "course-skin-care", name: "피부관리", path: "/courses/skin-care", sortOrder: 4 },
    { parent: "courses", slug: "course-body-care", name: "바디관리", path: "/courses/body-care", sortOrder: 5 },
    { parent: "courses", slug: "course-theory", name: "이론", path: "/courses/theory", sortOrder: 6 },
    { parent: "courses", slug: "course-business", name: "경영", path: "/courses/business", sortOrder: 7 },
  ];
  for (const c of childMenus) {
    const doc = await upsert(Menu, { slug: c.slug }, {
      parentId: menuMap[c.parent],
      slug: c.slug,
      name: c.name,
      path: c.path,
      depth: 1,
      sortOrder: c.sortOrder,
      isVisible: true,
      linkType: "internal",
    });
    menuMap[c.slug] = doc._id;
  }
  console.log(`✓ Menus ${rootMenus.length + childMenus.length}건`);

  // ─── Tags ────────────────────────────────────────────
  const tagDefs = [
    "왁싱", "브라질리언", "눈썹", "두피관리", "페이스디자인",
    "피부관리", "창업", "초급", "전문가", "원데이", "이론", "경영",
  ];
  const tagMap = {};
  for (const name of tagDefs) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const doc = await upsert(Tag, { slug }, { name, slug, usageCount: 0 });
    tagMap[name] = doc._id;
  }
  console.log(`✓ Tags ${tagDefs.length}건`);

  // ─── Users (테스트) ──────────────────────────────────
  const now = new Date();
  const yearLater = new Date(now);
  yearLater.setFullYear(yearLater.getFullYear() + 1);

  const userDefs = [
    { key: "admin", email: "admin@klead.test", name: "관리자", nickname: "admin", role: "admin", authProviderId: "test-admin" },
    { key: "basic", email: "basic@klead.test", name: "베이직회원", nickname: "basic", role: "member", authProviderId: "test-basic" },
    { key: "premium", email: "premium@klead.test", name: "프리미엄회원", nickname: "premium", role: "member", authProviderId: "test-premium" },
    { key: "master", email: "master@klead.test", name: "마스터회원", nickname: "master", role: "member", authProviderId: "test-master" },
    { key: "waxing", email: "waxing@klead.test", name: "왁싱전용회원", nickname: "waxing-only", role: "member", authProviderId: "test-waxing" },
    { key: "scalp", email: "scalp@klead.test", name: "두피전용회원", nickname: "scalp-only", role: "member", authProviderId: "test-scalp" },
    { key: "guest", email: "guest@klead.test", name: "미구독회원", nickname: "guest", role: "member", authProviderId: "test-guest" },
  ];
  const userMap = {};
  for (const u of userDefs) {
    const doc = await upsert(User, { authProvider: "test", authProviderId: u.authProviderId }, {
      email: u.email,
      name: u.name,
      nickname: u.nickname,
      authProvider: "test",
      authProviderId: u.authProviderId,
      role: u.role,
      status: "active",
      lastLoginAt: now,
    });
    userMap[u.key] = doc._id;
  }
  console.log(`✓ Users(테스트) ${userDefs.length}건`);

  // Subscriptions
  await Subscription.deleteMany({ note: /시드/ });
  const subDefs = [
    { user: "basic", program: "basic", note: "시드-Basic 구독" },
    { user: "premium", program: "premium", note: "시드-Premium 구독" },
    { user: "master", program: "master", note: "시드-Master 구독" },
  ];
  for (const s of subDefs) {
    await Subscription.create({
      userId: userMap[s.user],
      programId: programMap[s.program],
      status: "active",
      startAt: now,
      endAt: yearLater,
      autoRenew: false,
      grantedBy: userMap.admin,
      note: s.note,
    });
  }
  console.log(`✓ Subscriptions ${subDefs.length}건`);

  // UserPermissions (개별 권한 — 클래스별 테스트용)
  await UserPermission.deleteMany({ note: /시드/ });
  const manualPerms = [
    { user: "waxing", perm: "Waxing_Basic", note: "시드-왁싱 Basic 개별부여" },
    { user: "waxing", perm: "Waxing_Master", note: "시드-왁싱 Master 개별부여" },
    { user: "scalp", perm: "Scalp_Basic", note: "시드-두피 Basic 개별부여" },
    { user: "scalp", perm: "Scalp_Master", note: "시드-두피 Master 개별부여" },
  ];
  for (const mp of manualPerms) {
    await UserPermission.create({
      userId: userMap[mp.user],
      permissionTypeId: permMap[mp.perm],
      source: "manual",
      startAt: now,
      endAt: yearLater,
      grantedBy: userMap.admin,
      note: mp.note,
    });
  }
  console.log(`✓ UserPermissions ${manualPerms.length}건`);

  // ─── Contents (공지 + 강의) ───────────────────────────
  const published = { status: "published", startDt: now };

  const notice = await upsert(Content, { slug: "notice-welcome" }, {
    slug: "notice-welcome",
    type: "content",
    contentCategory: "notice",
    title: "클리드 온라인 강의 오픈 안내",
    summary: "구독형 LMS 오픈을 안내드립니다.",
    body: "<p>클리드 온라인 강의 플랫폼이 오픈되었습니다. 프로그램별 권한에 따라 강의를 수강하실 수 있습니다.</p>",
    isPinned: true,
    isPublic: true,
    publish: published,
    priceDisplay: "free",
    viewCount: 120,
    likeCount: 8,
    commentCount: 2,
    tagIds: [tagMap["초급"]],
    seo: { title: "클리드 오픈 안내", description: "온라인 강의 오픈", keywords: ["공지"] },
    createdBy: userMap.admin,
    updatedBy: userMap.admin,
  });

  const lectureDefs = [
    { slug: "waxing-basic-01", title: "왁싱 기초", category: "waxing", perm: "Waxing_Basic", instructor: "shin-semi", tags: ["왁싱", "초급"], thumb: "https://cdn-optimized.imweb.me/upload/S20251222d59af4baed4e5/650b6f8380154.png?w=800" },
    { slug: "waxing-brazilian-01", title: "브라질리언 왁싱", category: "waxing", perm: "Waxing_Master", instructor: "shin-semi", tags: ["왁싱", "브라질리언", "전문가"] },
    { slug: "eyebrow-basic-01", title: "얼굴형 분석과 눈썹 디자인", category: "eyebrow", perm: "Eyebrow_Basic", instructor: "shin-semi", tags: ["눈썹", "초급"] },
    { slug: "eyebrow-master-01", title: "눈썹 실전 사례", category: "eyebrow", perm: "Eyebrow_Master", instructor: "shin-semi", tags: ["눈썹", "전문가"] },
    { slug: "scalp-basic-01", title: "두피 구조와 진단", category: "scalp", perm: "Scalp_Basic", instructor: "kim-yujeong", tags: ["두피관리", "초급"], thumb: "https://cdn-optimized.imweb.me/upload/S20251222d59af4baed4e5/52819a4c001ec.png?w=800" },
    { slug: "scalp-master-01", title: "탈모 관리와 홈케어", category: "scalp", perm: "Scalp_Master", instructor: "kim-yujeong", tags: ["두피관리", "전문가"] },
    { slug: "face-design-basic-01", title: "페이스 디자인 기초", category: "face_design", perm: "FaceDesign_Basic", instructor: "kim-boryeong", tags: ["페이스디자인", "초급"], thumb: "https://cdn-optimized.imweb.me/upload/S20251222d59af4baed4e5/c2f06e1d1699c.png?w=800" },
    { slug: "face-design-master-01", title: "윤곽 디자인 실전 케이스", category: "face_design", perm: "FaceDesign_Master", instructor: "kim-boryeong", tags: ["페이스디자인", "전문가"] },
    { slug: "skin-care-basic-01", title: "피부관리 입문", category: "skin_care", perm: "SkinCare_Basic", instructor: "kim-yujeong", tags: ["피부관리", "초급"] },
    { slug: "body-care-basic-01", title: "바디관리 입문", category: "body_care", perm: "BodyCare_Basic", instructor: "kim-yujeong", tags: ["초급"] },
    { slug: "theory-basic-01", title: "피부 구조 이론", category: "theory", perm: "Theory_Basic", instructor: "moon-seolhui", tags: ["이론", "초급"] },
    { slug: "business-basic-01", title: "고객 상담과 창업", category: "business", perm: "Business_Basic", instructor: "moon-seolhui", tags: ["경영", "창업", "초급"] },
    { slug: "business-master-01", title: "샵 운영 마스터", category: "business", perm: "Business_Master", instructor: "kim-boryeong", tags: ["경영", "전문가"] },
  ];

  const contentMap = { notice: notice._id };
  const menuCategorySlug = {
    waxing: "course-waxing",
    eyebrow: "course-eyebrow",
    scalp: "course-scalp",
    face_design: "course-face-design",
    skin_care: "course-skin-care",
    body_care: "course-body-care",
    theory: "course-theory",
    business: "course-business",
  };

  await MenuContent.deleteMany({});
  await ContentPermission.deleteMany({});

  let lectureOrder = 0;
  for (const lec of lectureDefs) {
    const doc = await upsert(Content, { slug: lec.slug }, {
      slug: lec.slug,
      type: "lecture",
      lectureCategory: lec.category,
      title: lec.title,
      summary: `${lec.title} — 클리드 실전 교육 과정`,
      body: `<p>${lec.title} 강의 본문입니다. Bunny Stream videoId는 추후 등록합니다.</p>`,
      thumbnail: lec.thumb,
      videoId: `seed-video-${lec.slug}`,
      videoDuration: 1800,
      videoStatus: "ready",
      instructorId: instructorMap[lec.instructor],
      lectureMode: "online",
      isPinned: false,
      isPublic: false,
      publish: published,
      priceDisplay: "inquiry",
      viewCount: 10 + lectureOrder * 3,
      likeCount: lectureOrder % 5,
      commentCount: 0,
      tagIds: lec.tags.map((t) => tagMap[t]).filter(Boolean),
      seo: { title: lec.title, description: lec.title, keywords: lec.tags },
      createdBy: userMap.admin,
      updatedBy: userMap.admin,
    });
    contentMap[lec.slug] = doc._id;

    await ContentPermission.create({
      contentId: doc._id,
      permissionTypeId: permMap[lec.perm],
    });

    const menuSlug = menuCategorySlug[lec.category];
    if (menuSlug && menuMap[menuSlug]) {
      await MenuContent.create({
        menuId: menuMap[menuSlug],
        contentId: doc._id,
        sortOrder: lectureOrder,
      });
    }
    lectureOrder++;
  }

  // 공지 → community 메뉴 연결
  await MenuContent.create({
    menuId: menuMap.community,
    contentId: notice._id,
    sortOrder: 0,
  });

  console.log(`✓ Contents 강의 ${lectureDefs.length}건 + 공지 1건`);
  console.log(`✓ ContentPermissions / MenuContents 연결 완료`);

  // ─── FAQ / Popup / Comment / Like / Review / QnA ─────
  await Faq.deleteMany({});
  await Faq.insertMany([
    { category: "구독", question: "프로그램은 어떻게 선택하나요?", answer: "<p>Basic / Premium / Master 중 선택합니다. 각 프로그램별 접근 권한이 다릅니다.</p>", sortOrder: 0, isPublished: true },
    { category: "강의", question: "오프라인 원데이 과정도 있나요?", answer: "<p>네. 원데이 실습·출장 컨설팅 과정은 가격문의로 안내드립니다.</p>", sortOrder: 1, isPublished: true },
    { category: "계정", question: "카카오 로그인은 언제 되나요?", answer: "<p>2차 개발에서 카카오 로그인이 제공됩니다.</p>", sortOrder: 2, isPublished: true },
  ]);
  console.log("✓ FAQ 3건");

  const popupStart = new Date(now);
  const popupEnd = new Date(now);
  popupEnd.setMonth(popupEnd.getMonth() + 1);
  await Popup.deleteMany({ title: /시드/ });
  await Popup.create({
    title: "시드-얼리버드 안내",
    body: "<p>얼리버드 할인 마감 임박! 기회를 놓치지 마세요.</p>",
    linkUrl: "/courses",
    linkTarget: "_self",
    display: { startDt: popupStart, endDt: popupEnd, showOnce: true, pages: ["/"] },
    sortOrder: 0,
    isActive: true,
  });
  console.log("✓ Popup 1건");

  await Comment.deleteMany({});
  await Comment.create({
    contentId: notice._id,
    userId: userMap.basic,
    body: "오픈 축하드립니다!",
    isHidden: false,
  });
  await Like.deleteMany({});
  await Like.create({ contentId: notice._id, userId: userMap.basic });
  await Like.create({ contentId: notice._id, userId: userMap.premium });

  await Review.deleteMany({});
  await Review.create({
    contentId: contentMap["waxing-basic-01"],
    userId: userMap.basic,
    rating: 5,
    title: "기초가 탄탄해졌어요",
    body: "왁싱 기초 강의가 실무에 바로 도움이 됩니다.",
    isVisible: true,
    isFeatured: true,
  });

  await QnA.deleteMany({});
  await QnA.create({
    userId: userMap.basic,
    contentId: contentMap["waxing-basic-01"],
    category: "강의",
    title: "왁싱 기초 교재는 어디서 받나요?",
    body: "자료실에 교재가 있나요?",
    status: "answered",
    isPrivate: false,
    answer: {
      body: "강의 상세 페이지 첨부파일에서 다운로드 가능합니다.",
      answeredBy: userMap.admin,
      answeredAt: now,
    },
  });
  console.log("✓ Comment/Like/Review/QnA 테스트 데이터");

  // ─── 요약 출력 ───────────────────────────────────────
  console.log("\n========== 시드 완료 ==========");
  console.log("\n[테스트 계정]");
  console.log("  admin@klead.test     → 관리자");
  console.log("  basic@klead.test     → Basic 구독 (입문 권한)");
  console.log("  premium@klead.test   → Premium 구독 (입문+심화)");
  console.log("  master@klead.test    → Master 구독 (전체)");
  console.log("  waxing@klead.test    → 왁싱 Basic+Master 개별권한");
  console.log("  scalp@klead.test     → 두피 Basic+Master 개별권한");
  console.log("  guest@klead.test     → 구독/권한 없음");
  console.log("\n[프로그램]");
  console.log("  Basic   → 입문 권한 8종");
  console.log("  Premium → Basic + Master(주요 종목)");
  console.log("  Master  → 전체 PermissionTypes");
  console.log("\n※ 카카오 로그인 2차 이전 — authProvider=test 로 저장됨");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
