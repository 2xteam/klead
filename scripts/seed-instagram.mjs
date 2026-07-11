/**
 * 인스타그램 피드(홈 하단) → DB(InstagramPost) 시드.
 * 데이터: scripts/data/klead-instagram.json (이미지 R2 이관본 + 캡션)
 * 실행: npm run seed:instagram
 */
import dns from "node:dns";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("MONGODB_URI 필요"); process.exit(1); }

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const items = JSON.parse(
  readFileSync(path.join(__dirname, "data", "klead-instagram.json"), "utf8"),
);

const InstagramPost =
  mongoose.models.InstagramPost ||
  mongoose.model(
    "InstagramPost",
    new mongoose.Schema(
      {
        image: String,
        link: String,
        caption: String,
        sortOrder: Number,
        isActive: Boolean,
      },
      { timestamps: true },
    ),
  );

await mongoose.connect(MONGODB_URI);
await InstagramPost.deleteMany({});
let n = 0;
for (const it of items) {
  await InstagramPost.create({
    image: it.image,
    link: it.link || it.href || "",
    caption: it.caption || "",
    sortOrder: n,
    isActive: true,
  });
  n++;
}
console.log(`InstagramPost 시드 완료: ${n}건`);
await mongoose.disconnect();
