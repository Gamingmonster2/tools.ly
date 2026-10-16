/**
 * Search-intent coverage check.
 *
 * A page only ranks for a query when its TITLE, H1, meta description and body all agree
 * with what the searcher typed. This reads the built HTML and reports, per keyword, where
 * it actually appears — the fastest way to see whether an edit matched the intent or only
 * added the phrase somewhere harmless.
 *
 *   node tools/check-intent.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");

/** Each page, with the queries it is supposed to own. */
const targets = [
  {
    page: "/ar/مصلح-النص-العربي/",
    intent: "إصلاح النص المكسور",
    keywords: [
      "مشكلة نسخ النص العربي من pdf",
      "النص العربي معكوس",
      "تحويل نص عربي مقلوب",
      "إصلاح النص العربي",
      "عكس النص العربي",
    ],
  },
  {
    page: "/ar/احسب-عمرك-بالهجري/",
    intent: "العمر بالهجري",
    keywords: [
      "احسب عمري بالهجري",
      "كم عمري بالهجري",
      "كيف احسب عمري بالهجري",
      "حساب العمر بالهجري والميلادي",
      "حاسبة العمر بالهجري",
    ],
  },
  {
    page: "/ar/التقويم-الهجري/",
    intent: "تحويل التاريخ",
    keywords: [
      "تحويل التاريخ الهجري الى ميلادي",
      "التاريخ الهجري اليوم",
      "كم تاريخ اليوم بالهجري",
      "محول التاريخ الهجري",
      "تحويل الميلادي الى هجري",
    ],
  },
  {
    page: "/ar/عداد-الحروف/",
    intent: "عدّ النص العربي",
    keywords: ["عداد الحروف", "عدد الكلمات", "حساب الكلمات", "عد الكلمات العربية"],
  },
];

/** Arabic needs normalisation before comparing: hamza forms, taa marbuta, diacritics. */
const normalise = (text) =>
  text
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // harakat and tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

const countIn = (haystack, needle) => {
  if (!needle) return 0;
  const parts = normalise(haystack).split(normalise(needle));
  return Math.max(0, parts.length - 1);
};

let pagesChecked = 0;
let missing = 0;

for (const target of targets) {
  const file = join(dist, target.page.replace(/^\/|\/$/g, ""), "index.html");
  if (!existsSync(file)) {
    console.log(`\n✗ ${target.page} — لم تُبنَ`);
    missing += 1;
    continue;
  }

  const html = readFileSync(file, "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, "") ?? "";
  const description = html.match(/name="description"\s+content="([^"]+)"/)?.[1] ?? "";
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  pagesChecked += 1;
  console.log(`\n### ${target.page}`);
  console.log(`  النية: ${target.intent}`);
  console.log(`  العنوان: ${title}`);
  console.log("  الكلمة المفتاحية                       عنوان  H1  وصف  المتن");
  console.log("  " + "-".repeat(58));

  for (const keyword of target.keywords) {
    const t = countIn(title, keyword) ? " ✔ " : " · ";
    const h = countIn(h1, keyword) ? " ✔ " : " · ";
    const d = countIn(description, keyword) ? " ✔ " : " · ";
    const b = countIn(body, keyword);
    const flag = t.includes("✔") || h.includes("✔") || b > 0 ? " " : "⚠";
    if (flag === "⚠") missing += 1;
    console.log(`  ${keyword.padEnd(36)} ${t}  ${h}  ${d}  ${String(b).padStart(3)} ${flag}`);
  }
}

console.log(`\n${"=".repeat(64)}`);
console.log(`صفحات مفحوصة: ${pagesChecked} · كلمات لا تظهر في أي مكان: ${missing}`);
console.log("القاعدة: الكلمة المهمّة يجب أن تظهر في **العنوان** أو **H1** على الأقل.");
console.log("ظهورها في المتن وحده ضعيف — جوجل يعرف موضوع الصفحة من عنوانها.");
console.log("وقبل كل ذلك: تأكد أن الناس تبحث عنها فعلاً — node tools/demand-check.mjs");
