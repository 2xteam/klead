/**
 * 강의(lecture) 데이터에 권한 키(permissionTypeId)를 부여하고,
 * 강의(학습) 페이지용 learnSections 샘플을 등록한다.
 * 실행: npm run seed:lecturepages
 */
import mongoose from "mongoose";

const Content =
  mongoose.models.Content ||
  mongoose.model("Content", new mongoose.Schema({}, { strict: false, timestamps: true }));
const ContentPermission =
  mongoose.models.ContentPermission ||
  mongoose.model(
    "ContentPermission",
    new mongoose.Schema({}, { strict: false, timestamps: true }),
  );

await mongoose.connect(process.env.MONGODB_URI);

const lectures = await Content.find({ type: "lecture", deletedAt: null }).lean();
console.log(`강의 ${lectures.length}개`);

let withPerm = 0;
for (const lec of lectures) {
  // 1) 기존 ContentPermission → 강의의 permissionTypeId
  const cp = await ContentPermission.findOne({ contentId: lec._id })
    .select("permissionTypeId")
    .lean();
  const permissionTypeId = cp?.permissionTypeId ?? null;
  if (permissionTypeId) withPerm++;

  // 2) 강의 페이지 샘플 콘텐츠(어떤 강의인지 정도)
  const learnSections = [
    {
      key: "intro",
      type: "richText",
      theme: "dark",
      title: `${lec.title} · 강의실`,
      body: `이 페이지는 '${lec.title}' 강의의 학습(강의) 페이지입니다.\n권한을 보유한 수강생에게만 열람이 허용됩니다.\n커리큘럼과 강의 영상이 이곳에 순차적으로 등록됩니다.`,
      sortOrder: 0,
    },
    {
      key: "curriculum",
      type: "steps",
      theme: "dark",
      title: "커리큘럼 (샘플)",
      lazy: true,
      items: [
        { title: "01\n오리엔테이션", bullets: ["강의 소개", "준비물 안내"], sortOrder: 0 },
        { title: "02\n기본 이론", bullets: ["핵심 개념", "현장 사례"], sortOrder: 1 },
        { title: "03\n실습", bullets: ["단계별 실습", "피드백"], sortOrder: 2 },
        { title: "04\n마무리", bullets: ["Q&A", "수료"], sortOrder: 3 },
      ],
      sortOrder: 1,
    },
  ];

  await Content.updateOne(
    { _id: lec._id },
    { $set: { permissionTypeId, learnSections } },
  );
}

console.log(`권한 매핑: ${withPerm}/${lectures.length} · learnSections 등록 완료`);
await mongoose.disconnect();
console.log("완료.");
