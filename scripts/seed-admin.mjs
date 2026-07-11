/**
 * 관리자 비밀번호를 SiteSetting(key=admin_password)에 등록.
 * 실행: npm run seed:admin
 * 기본값 1004 — 변경하려면 ADMIN_PASSWORD 환경변수로 덮어쓰기.
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
const password = process.env.ADMIN_PASSWORD ?? "1004";

const SiteSetting =
  mongoose.models.SiteSetting ||
  mongoose.model(
    "SiteSetting",
    new mongoose.Schema(
      {
        key: { type: String, unique: true },
        value: mongoose.Schema.Types.Mixed,
        group: String,
        description: String,
      },
      { timestamps: { createdAt: false, updatedAt: true } },
    ),
  );

await mongoose.connect(MONGODB_URI);
await SiteSetting.findOneAndUpdate(
  { key: "admin_password" },
  {
    key: "admin_password",
    value: password,
    group: "general",
    description: "관리자 콘솔 진입 비밀번호",
  },
  { upsert: true, new: true, setDefaultsOnInsert: true },
);
console.log(`SiteSetting admin_password 등록됨 (value=${password})`);
await mongoose.disconnect();
