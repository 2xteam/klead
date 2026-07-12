/**
 * klead 강의 상품 상세 이미지(상세정보) → R2 이관 + DB 등록.
 * 데이터: scratchpad class-detail.json 대신 URL 하드코딩(재현 가능).
 * 실행: node --env-file=.env.local scripts/seed-class-detail.mjs
 */
import dns from "node:dns";
import mongoose from "mongoose";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const PUB = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");
const O = "https://cdn-optimized.imweb.me";
const up_ = (p) => `${O}${p}`;

// idx → { slug, main(750), details[] }  — 공용 푸터 스트립(5476335)은 제외
const DATA = {
  12: {
    slug: "consulting-oneday",
    main: up_("/thumbnail/20260705/27a3cfea012d7.png"),
    details: ["eb823666b7bb1","a8764b33dc411","cbd1bf68bdd30","60c7359b57806","3ce00b3bd1581","834d49930ed79","d7b75f0523eda","075ba5bce3fc0","b9e6f098dcc47"].map((h)=>up_(`/upload/S20251222d59af4baed4e5/${h}.png`)),
  },
  10: {
    slug: "face-design-today",
    main: up_("/thumbnail/20260704/b9a9012783d64.png"),
    details: ["81f0a4a694989","45ba5bfca67b6","30d309ee366ff","d43ca8bbadfbf","defbd9bed760f","5b68be8f08a16","6e9a2bd5d3506","eb4042fb7194b"].map((h)=>up_(`/upload/S20251222d59af4baed4e5/${h}.png`)),
  },
  7: {
    slug: "scalp-oneday",
    main: up_("/thumbnail/20260709/e3e0e98f920d1.png"),
    details: ["3efbc39c1075e","ed267ef4954e3","bf96fffd2702a","9dea75f2bb17f","1a79d162f94f7","247587f669d33","c1d584afebae3","5e24e8db2c372"].map((h)=>up_(`/upload/S20251222d59af4baed4e5/${h}.png`)),
  },
};

async function up(url, key) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Referer: "https://klead.kr/" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await s3.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, Body: buf, ContentType: "image/png", CacheControl: "public, max-age=31536000, immutable" }));
  return `${PUB}/${key}`;
}

const Content = mongoose.models.Content || mongoose.model("Content", new mongoose.Schema({}, { strict: false, timestamps: true }));

await mongoose.connect(process.env.MONGODB_URI);
for (const [idx, d] of Object.entries(DATA)) {
  const mainUrl = await up(d.main, `klead/class/${idx}/main.png`);
  const detailUrls = [];
  for (let i = 0; i < d.details.length; i++) {
    detailUrls.push(await up(d.details[i], `klead/class/${idx}/detail-${String(i + 1).padStart(2, "0")}.png`));
  }
  // 상세정보 = 실제 상세 이미지들(image 타입 섹션, 순서대로)
  const sections = detailUrls.map((url, i) => ({
    key: `detail-${i + 1}`,
    type: "image",
    theme: "light",
    imageUrl: url,
    sortOrder: i,
    lazy: i > 0,
  }));
  await Content.updateOne(
    { slug: d.slug, type: "lecture" },
    { $set: { gallery: [mainUrl], sections } },
  );
  console.log(`${d.slug} (idx=${idx}): main + 상세 ${detailUrls.length}장 등록`);
}
await mongoose.disconnect();
console.log("완료.");
