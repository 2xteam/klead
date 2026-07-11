/**
 * imweb CDN 이미지 → Cloudflare R2 이관.
 * 대상: src/config/site.ts + scripts/data/klead-classes.json 안의 imweb URL 전부.
 * 동작: 다운로드 → R2(klead/assets/<파일명>) 업로드 → 소스 파일의 URL을 R2 공개 URL로 치환.
 * 실행: npm run migrate:images
 */
import dns from "node:dns";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC_URL = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");
const PREFIX = process.env.R2_PREFIX ?? "";
const BUCKET = process.env.R2_BUCKET;

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const targets = [
  path.join(ROOT, "src", "config", "site.ts"),
  path.join(ROOT, "scripts", "data", "klead-classes.json"),
];

// 파일에서 imweb URL 수집
const urlRe = /https:\/\/cdn(?:-optimized)?\.imweb\.me\/[^\s"')]+/g;
const found = new Set();
const fileContents = {};
for (const f of targets) {
  const txt = readFileSync(f, "utf8");
  fileContents[f] = txt;
  for (const m of txt.matchAll(urlRe)) found.add(m[0]);
}
console.log(`발견한 imweb URL: ${found.size}개`);

const ctByExt = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" };
const map = {};
for (const url of found) {
  const noQuery = url.split("?")[0];
  const base = noQuery.split("/").pop(); // e.g. 650b6f8380154.png
  const ext = (base.split(".").pop() || "png").toLowerCase();
  const key = `${PREFIX}klead/assets/${base}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) { console.log(`  SKIP ${res.status} ${url}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET, Key: key, Body: buf,
      ContentType: ctByExt[ext] || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }));
    map[url] = `${PUBLIC_URL}/${key}`;
    console.log(`  OK ${buf.length.toString().padStart(8)}B  ${base}`);
  } catch (e) {
    console.log(`  ERR ${url} ${String(e).split("\n")[0]}`);
  }
}

// 소스 파일의 URL 치환
let replaced = 0;
for (const f of targets) {
  let txt = fileContents[f];
  for (const [from, to] of Object.entries(map)) {
    if (txt.includes(from)) { txt = txt.split(from).join(to); replaced++; }
  }
  writeFileSync(f, txt);
}
writeFileSync(path.join(__dirname, "data", "r2-image-map.json"), JSON.stringify(map, null, 2));
console.log(`\n업로드 ${Object.keys(map).length}개, 파일 내 URL 치환 ${replaced}건. 맵: scripts/data/r2-image-map.json`);
