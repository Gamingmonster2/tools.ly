/**
 * Demand check — does anyone actually search for this?
 *
 * Competition is only half the question. A keyword with no competing tool may simply be a
 * keyword nobody types, and a tool built for it is worthless. Google's autocomplete is a
 * usable demand signal: it only suggests queries that real people actually search, so a
 * phrase that appears there has demand, and a phrase that never appears as a completion
 * probably has none.
 *
 *   node tools/demand-check.mjs                      harvest from the seed list
 *   node tools/demand-check.mjs "الحروف العربية متقطعة"   test one phrase
 *   node tools/demand-check.mjs --yt "كيف أصلح"       harvest YouTube suggestions
 *
 * Honest limits: autocomplete is a proxy, not a volume number. It tells you whether a
 * phrase is searched at all, not how often. A phrase can be missing here and still get a
 * trickle of traffic; a phrase present here is definitely searched by real people.
 */

const args = process.argv.slice(2);
const useYouTube = args.includes("--yt");
const phrases = args.filter((a) => !a.startsWith("--"));

const SEEDS = [
  "أداة",
  "كيف أحول",
  "كيف أصلح",
  "الحروف العربية",
  "النص العربي",
  "إصلاح النص العربي",
  "تحويل نص عربي",
  "مشكلة النص العربي",
];

const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
  "accept-language": "ar,en;q=0.8",
};

const suggest = async (query) => {
  const params = new URLSearchParams({
    client: "firefox",
    hl: "ar",
    q: query,
  });
  if (useYouTube) params.set("ds", "yt");

  const response = await fetch(`https://suggestqueries.google.com/complete/search?${params}`, {
    headers: HEADERS,
  });
  if (!response.ok) return [];
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed?.[1]) ? parsed[1].map(String) : [];
  } catch {
    return [];
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log(useYouTube ? "\n=== اقتراحات YouTube ===\n" : "\n=== اقتراحات بحث جوجل ===\n");

if (phrases.length) {
  // A specific phrase: does Google complete it, and what else does it suggest around it?
  for (const phrase of phrases) {
    const direct = await suggest(phrase);
    const extended = await suggest(`${phrase} `);
    const all = [...new Set([...direct, ...extended])];
    const isItself = direct.some((s) => s.trim() === phrase.trim());

    console.log(`### ${phrase}`);
    console.log(
      isItself
        ? "  ✅ العبارة نفسها تظهر كاقتراح — هناك بحث حقيقي عنها"
        : direct.length === 0 && extended.length === 0
          ? "  ❌ لا اقتراحات إطلاقاً — العبارة ليست في قاموس بحث جوجل"
          : "  ⚠ لا تظهر العبارة نفسها، لكن تظهر عبارات قريبة (الطلب على صيغة أخرى)"
    );
    for (const s of all.slice(0, 10)) console.log(`     · ${s}`);
    await sleep(1200);
  }
} else {
  // Harvest: what do people actually type around these seeds?
  const harvested = new Map();
  for (const seed of SEEDS) {
    const suggestions = [...(await suggest(seed)), ...(await suggest(`${seed} `))];
    console.log(`### ${seed}`);
    if (suggestions.length === 0) {
      console.log("     (لا اقتراحات)");
    }
    for (const s of [...new Set(suggestions)].slice(0, 12)) {
      console.log(`     · ${s}`);
      harvested.set(s, (harvested.get(s) ?? 0) + 1);
    }
    await sleep(1200);
  }
  console.log(`\n${"=".repeat(60)}`);
  console.log(`إجمالي العبارات المكتشفة: ${harvested.size}`);
  console.log("هذه عبارات يكتبها الناس فعلاً — ابنِ لها، لا لما تخيّله أنت.");
}

console.log(
  "\nملاحظة: هذا يقيس **وجود الطلب** لا حجمه. للحجم الفعلي: Google Keyword Planner أو Search Console بعد أن تجمع بياناتك."
);
