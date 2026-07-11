import fs from "node:fs";

const html = fs.readFileSync(
  "docs/design/reference/klead-expert-33.html",
  "utf8",
);

const strip = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n +/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// Main content area roughly between <main> blocks after header
const mains = [...html.matchAll(/<main>([\s\S]*?)<\/main>/g)].map((m) => m[1]);
console.log("main count:", mains.length);

const texts = [];
for (const main of mains) {
  for (const m of main.matchAll(
    /class="widget _text_wrap[\s\S]*?<div class="text-table[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g,
  )) {
    const t = strip(m[1]);
    if (t.length > 3) texts.push(t);
  }
}

const unique = [];
for (const t of texts) {
  if (!unique.includes(t)) unique.push(t);
}

unique.forEach((t, i) => {
  console.log(`\n=== ${i + 1} ===`);
  console.log(t.slice(0, 800));
});

// images in main
const imgs = new Set();
for (const main of mains) {
  for (const m of main.matchAll(/src="(https:\/\/cdn\.imweb\.me\/[^"]+)"/g)) {
    imgs.add(m[1]);
  }
  for (const m of main.matchAll(
    /background-image:url\('(https:\/\/cdn\.imweb\.me\/[^']+)'\)/g,
  )) {
    imgs.add(m[1]);
  }
}
console.log("\n=== IMAGES ===");
[...imgs].forEach((u) => console.log(u));
