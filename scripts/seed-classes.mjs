/**
 * klead.kr 실제 강의 3종(shop_view idx=7/10/12) → DB 등록
 * 데이터: scripts/data/klead-classes.json (Playwright OCR 전사본)
 * 실행: npm run seed:classes
 */
import dns from "node:dns";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI 필요");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(path.join(__dirname, "data", "klead-classes.json"), "utf8"),
);

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
        lectureCategory: String,
        title: String,
        summary: String,
        body: String,
        thumbnail: String,
        sections: [Schema.Types.Mixed],
        relatedInstructorIds: [{ type: Schema.Types.ObjectId, ref: "Instructor" }],
        instructorId: { type: Schema.Types.ObjectId, ref: "Instructor" },
        lectureMode: String,
        isPinned: Boolean,
        isPublic: Boolean,
        publish: { startDt: Date, endDt: Date, status: String },
        priceDisplay: String,
        priceAmount: Number,
        viewCount: Number,
        likeCount: Number,
        commentCount: Number,
        seo: { title: String, description: String, keywords: [String], ogImage: String },
        deletedAt: Date,
      },
      { timestamps: true },
    ),
  );

// 강의 → Content.sections 매핑
function buildSections(cls) {
  const sections = [];
  let order = 0;

  if (cls.insights?.length) {
    sections.push({
      key: "insight",
      title: "Industry Insight",
      sortOrder: order++,
      items: cls.insights.map((t, i) => ({ title: t, sortOrder: i })),
    });
  }

  sections.push({
    key: "curriculum",
    title: "원데이 커리큘럼",
    sortOrder: order++,
    items: cls.curriculum.map((c, i) => ({
      title: `${c.step} ${c.title}`.trim(),
      subtitle: c.headline || undefined,
      description: c.description || undefined,
      bullets: c.points?.length ? c.points : undefined,
      sortOrder: i,
    })),
  });

  sections.push({
    key: "philosophy",
    title: "KLEAD is not a school – It's a system.",
    sortOrder: order++,
    items: cls.philosophy.map((p, i) => ({
      title: p.title,
      description: p.description,
      sortOrder: i,
    })),
  });

  return sections;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB 연결됨");

  // 큐레이터(김보령 등) 실제 프로필 upsert
  const instructorIdBySlug = {};
  for (const [i, ins] of (data.instructors || []).entries()) {
    const careerText = [
      ins.tagline,
      ins.career?.length ? "[경력]\n" + ins.career.join("\n") : "",
      ins.awards?.length ? "[자격 & 수상]\n" + ins.awards.join("\n") : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    const doc = await Instructor.findOneAndUpdate(
      { slug: ins.slug },
      {
        slug: ins.slug,
        name: ins.name,
        title: ins.title,
        bio: ins.tagline,
        specialties: ins.specialties || [],
        career: careerText,
        sortOrder: i,
        isPublished: true,
        seo: { title: `${ins.name} | 클리드`, description: ins.tagline, keywords: ins.specialties },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    instructorIdBySlug[ins.slug] = doc._id;
    console.log(`  instructor: ${ins.name} (career ${ins.career?.length ?? 0}, awards ${ins.awards?.length ?? 0})`);
  }

  const published = {
    status: "published",
    startDt: new Date("2026-01-01T00:00:00Z"),
  };

  for (const [i, cls] of data.classes.entries()) {
    const doc = await Content.findOneAndUpdate(
      { slug: cls.slug },
      {
        slug: cls.slug,
        type: "lecture",
        lectureCategory: cls.lectureCategory,
        title: cls.title,
        summary: cls.summary,
        body: cls.rawText || "",
        thumbnail: cls.thumbnail,
        sections: buildSections(cls),
        instructorId: instructorIdBySlug["kim-boryeong"],
        relatedInstructorIds: instructorIdBySlug["kim-boryeong"]
          ? [instructorIdBySlug["kim-boryeong"]]
          : [],
        lectureMode: "offline",
        isPinned: i === 0,
        isPublic: true,
        publish: published,
        priceDisplay: "inquiry", // klead.kr: 가격 미표기(가격문의)
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        seo: {
          title: cls.title,
          description: cls.summary,
          keywords: cls.tags,
          ogImage: cls.thumbnail,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`  class: ${cls.title} [${cls.lectureCategory}] sections=${doc.sections.length}`);
  }

  await mongoose.disconnect();
  console.log("완료.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
