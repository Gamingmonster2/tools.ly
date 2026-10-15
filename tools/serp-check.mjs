/**
 * SERP gap finder.
 *
 * Your own method, automated: take a long-tail keyword, look at what actually ranks in the
 * top results, and judge whether the searcher is served by a DEDICATED TOOL PAGE or by
 * something tangential (a blog post, a forum thread, an app store listing). A keyword whose
 * top results contain no real tool is demand with weak supply — the only kind of keyword
 * worth building a tool for.
 *
 *   node tools/serp-check.mjs                 # the built-in Arabic + English shortlist
 *   node tools/serp-check.mjs "كلمة مفتاحية"   # a single keyword
 *
 * Notes on honesty: this reads DuckDuckGo's HTML results, which approximate Google but are
 * not identical, and it infers "is this a tool page" from the URL and title rather than
 * reading every page. Treat the verdict as a shortlist to check by hand, not as gospel.
 */

const keywordFile = process.argv.slice(2);
const DEFAULT_KEYWORDS = [
  "تحويل التاريخ الهجري الى ميلادي",
  "حاسبة العمر بالهجري",
  "تحويل الأرقام الهندية إلى عربية",
  "مقارنة نصين عربي",
  "إزالة التطويل من النص العربي",
  "حاسبة نهاية الخدمة",
  "حاسبة الزكاة على الذهب",
  "عداد الحروف العربية",
  "تفريغ الصور إلى نص عربي",
  "arabic diacritics remover",
  "hijri date converter",
  "arabic word counter online",
];

const keywords = keywordFile.length ? keywordFile : DEFAULT_KEYWORDS;
const TOP = 6;
// DuckDuckGo throttles aggressively. Slow down rather than misread a block page as
// "no results" — that mistake would invent opportunities that do not exist.
const DELAY_MS = 7000;
const RETRY_DELAY_MS = 20000;
const RETRIES = 2;

const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
  "accept-language": "ar,en;q=0.8",
};

/** Does this result look like a page whose entire purpose is the tool? */
const looksLikeTool = (title, url, keyword) => {
  const text = `${title} ${url}`.toLowerCase();
  const toolWords = [
    "tool", "tools", "calculator", "converter", "counter", "generator", "remover",
    "أداة", "أدوات", "حاسبة", "محول", "محوّل", "عداد", "عدّاد", "مولد", "مولّد",
    "إزالة", "حذف", "تحويل", "حساب",
  ];
  const offTopic = [
    "github.com", "pypi.org", "pub.dev", "npmjs.com", "stackoverflow", "apps.apple.com",
    "play.google.com", "youtube.com", "wikipedia.org", "reddit.com", "facebook.com",
  ];
  if (offTopic.some((host) => text.includes(host))) return false;

  // The strongest signal: the name of the tool appears in the URL path or the title.
  const words = keyword.split(/\s+/).filter((w) => w.length > 2);
  const hits = words.filter((w) => text.includes(w.toLowerCase())).length;
  const keywordMatch = words.length > 0 && hits / words.length >= 0.5;

  return keywordMatch && toolWords.some((w) => text.includes(w));
};

const parseResults = (html) => {
  const results = [];
  // DuckDuckGo's HTML endpoint marks every organic result with class="result__a".
  const linkRe = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

  let match;
  while ((match = linkRe.exec(html)) !== null && results.length < TOP) {
    let url = match[1];
    // DuckDuckGo wraps links: //duckduckgo.com/l/?uddg=<encoded>
    const wrapped = url.match(/uddg=([^&]+)/);
    if (wrapped) url = decodeURIComponent(wrapped[1]);
    if (url.startsWith("//")) url = `https:${url}`;
    try {
      const parsed = new URL(url);
      results.push({ title: strip(match[2]), url, host: parsed.hostname.replace(/^www\./, "") });
    } catch {
      // skip malformed
    }
  }
  return results;
};

const verdictFor = (toolCount, total) => {
  if (total === 0) return { label: "لا نتائج", tone: "?" };
  const ratio = toolCount / total;
  if (ratio <= 0.2) return { label: "فراغ — فرصة قوية", tone: "gap" };
  if (ratio <= 0.5) return { label: "منافسة متوسطة", tone: "mid" };
  return { label: "سوق مزدحم", tone: "busy" };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Distinguish "the engine found nothing" from "the engine refused to answer". */
const classifyEmpty = (html) =>
  /result__a|result__snippet/.test(html)
    ? "empty"
    : /no results|did not match|انقر|لا توجد نتائج/i.test(html)
      ? "empty"
      : "blocked";

const search = async (keyword) => {
  let lastHtml = "";
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await fetch(
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(keyword)}&kl=sa-ar`,
        { headers: HEADERS }
      );
      lastHtml = await response.text();
      const results = parseResults(lastHtml);
      if (results.length > 0) return { results, kind: "ok" };
      const kind = classifyEmpty(lastHtml);
      if (kind === "empty") return { results: [], kind: "empty" };
    } catch {
      // fall through to the retry
    }
    await sleep(RETRY_DELAY_MS);
  }
  return { results: [], kind: "blocked" };
};

const findings = [];

for (const keyword of keywords) {
  const { results, kind } = await search(keyword);

  if (kind === "blocked") {
    console.log(`\n### ${keyword}\n  ⏳ لم يُجب محرك البحث (حجب مؤقت) — أعد التشغيل لاحقاً`);
    findings.push({ keyword, verdict: "محجوب", toolCount: 0, total: 0, results: [] });
    await sleep(DELAY_MS);
    continue;
  }

  if (kind === "empty") {
    console.log(`\n### ${keyword}\n  ⚠ لا نتائج فعلية — كلمة مفتاحية غير مستخدمة (تخلَّ عنها)`);
    findings.push({ keyword, verdict: "غير مستخدمة", toolCount: 0, total: 0, results: [] });
    await sleep(DELAY_MS);
    continue;
  }

  const toolCount = results.filter((r) => looksLikeTool(r.title, r.url, keyword)).length;
  const verdict = verdictFor(toolCount, results.length);
  findings.push({ keyword, verdict: verdict.label, toolCount, total: results.length, results });

  console.log(`\n### ${keyword}`);
  console.log(`  ${verdict.label}  (${toolCount} من ${results.length} صفحات أدوات)`);
  for (const r of results) {
    const mark = looksLikeTool(r.title, r.url, keyword) ? "🔧" : "  ";
    console.log(`  ${mark} ${r.host.padEnd(28).slice(0, 28)} ${r.title.slice(0, 72)}`);
  }

  await sleep(DELAY_MS);
}

console.log(`\n${"=".repeat(72)}`);
console.log("الخلاصة — مرتّبة من أفضل فرصة إلى أسوأها\n");
const gaps = findings.filter((f) => f.verdict.startsWith("فراغ"));
const mids = findings.filter((f) => f.verdict.startsWith("منافسة"));
const busy = findings.filter((f) => f.verdict.startsWith("سوق"));
for (const f of [...gaps, ...mids, ...busy]) {
  console.log(`  ${f.verdict.padEnd(20)}  ${f.keyword}`);
}
console.log(
  `\nفراغات: ${gaps.length} · متوسطة: ${mids.length} · مزدحمة: ${busy.length} · أخطاء: ${
    findings.filter((f) => f.verdict === "خطأ").length
  }`
);
console.log("\nتحقّق يدوياً من الفراغات قبل البناء: افتح البحث في نافذة متخفّية وسجّل أول 5 نتائج.");
