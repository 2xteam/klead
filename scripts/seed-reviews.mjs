/**
 * 상품별(강의별) 샘플 구매평/Q&A 시드.
 * 실행: npm run seed:reviews
 * 리뷰는 Review(contentId=강의, userId=구매자)로 1:1 매칭 저장.
 */
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("MONGODB_URI 필요"); process.exit(1); }

const { Schema } = mongoose;
const model = (n, s) => mongoose.models[n] || mongoose.model(n, new Schema(s, { timestamps: true, strict: false }));

const User = model("User", {});
const Content = model("Content", {});
const Review = model("Review", {});
const QnA = model("QnA", {});

await mongoose.connect(MONGODB_URI);

// 1) 테스트 회원
const members = [
  { name: "이서연", authProvider: "test", authProviderId: "test-seoyeon" },
  { name: "박지민", authProvider: "test", authProviderId: "test-jimin" },
  { name: "최유나", authProvider: "test", authProviderId: "test-yuna" },
  { name: "정하람", authProvider: "test", authProviderId: "test-haram" },
];
const userIds = {};
for (const m of members) {
  const u = await User.findOneAndUpdate(
    { authProviderId: m.authProviderId },
    { ...m, role: "member", status: "active" },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  userIds[m.name] = u._id;
}

const classes = ["scalp-oneday", "face-design-today", "consulting-oneday"];
const reviewsByClass = {
  "scalp-oneday": [
    { name: "이서연", rating: 5, title: "매출로 바로 연결됐어요", body: "두피관리를 기존 관리에 붙였더니 객단가가 올랐어요. 설명하는 언어를 배운 게 제일 컸습니다.", featured: true },
    { name: "박지민", rating: 5, title: "실습 위주라 좋았습니다", body: "이론만이 아니라 바로 적용 가능한 수기 테크닉까지 배워서 현장에서 바로 썼어요." },
    { name: "최유나", rating: 4, title: "알찬 원데이", body: "5시간이 짧게 느껴질 만큼 내용이 많았어요. 복습 자료가 더 있으면 좋겠어요." },
  ],
  "face-design-today": [
    { name: "정하람", rating: 5, title: "재수강 필요 없는 수업", body: "얼굴 읽는 기준이 완전히 잡혔어요. 공식화된 설계라 초보도 따라 할 수 있습니다.", featured: true },
    { name: "이서연", rating: 5, title: "디자인 자신감이 생겼어요", body: "상담에서 신뢰를 만드는 구조까지 배워서 단가를 올릴 수 있었습니다." },
  ],
  "consulting-oneday": [
    { name: "박지민", rating: 5, title: "하루 만에 방향이 잡혔어요", body: "출장으로 직접 오셔서 우리 샵 동선·메뉴·상담을 다 봐주셨어요. 실행 가능한 것만 짚어주셔서 좋았습니다.", featured: true },
    { name: "최유나", rating: 5, title: "매출 구조가 바뀌었습니다", body: "선예약·주기 리워드 구조를 적용한 뒤 재방문율이 확 올랐어요." },
  ],
};
const qnaByClass = {
  "scalp-oneday": [
    { name: "최유나", title: "베드만 있으면 수강 가능한가요?", body: "장비가 따로 없어도 되는지 궁금합니다.", answered: "네, 베드만 있으면 기존 관리에 바로 붙일 수 있는 구조로 진행됩니다." },
    { name: "박지민", title: "수강 정원이 어떻게 되나요?", body: "소수 정원인가요?", answered: "" },
  ],
  "face-design-today": [
    { name: "이서연", title: "완전 초보도 가능할까요?", body: "왁싱 경험이 적어도 따라갈 수 있을지 궁금해요.", answered: "네, 초보자도 이해하고 적용할 수 있도록 공식화된 실무 교육으로 진행됩니다." },
  ],
  "consulting-oneday": [
    { name: "정하람", title: "지방도 출장 가능한가요?", body: "지방 샵인데 출장 컨설팅 되나요?", answered: "네, 전국 어디든 출장 진행합니다. 카카오채널로 문의 주세요." },
  ],
};

const now = new Date("2026-06-01T00:00:00Z");
let rc = 0, qc = 0;
for (const slug of classes) {
  const c = await Content.findOne({ slug }).lean();
  if (!c) { console.log("skip (no class):", slug); continue; }
  for (const r of reviewsByClass[slug] ?? []) {
    await Review.findOneAndUpdate(
      { contentId: c._id, userId: userIds[r.name] },
      { contentId: c._id, userId: userIds[r.name], rating: r.rating, title: r.title, body: r.body, isVisible: true, isFeatured: !!r.featured },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    rc++;
  }
  for (const q of qnaByClass[slug] ?? []) {
    const answer = q.answered ? { body: q.answered, answeredAt: now } : undefined;
    await QnA.findOneAndUpdate(
      { contentId: c._id, userId: userIds[q.name], title: q.title },
      { contentId: c._id, userId: userIds[q.name], title: q.title, body: q.body, category: "강의", status: q.answered ? "answered" : "pending", isPrivate: false, ...(answer ? { answer } : {}) },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    qc++;
  }
}
// likeCount 살짝
await Content.updateMany({ slug: { $in: classes } }, { $set: {} });
console.log(`리뷰 ${rc}건, Q&A ${qc}건 시드 완료 (테스트 회원 ${members.length}명)`);
await mongoose.disconnect();
