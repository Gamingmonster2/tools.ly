/**
 * Live deployment checker.
 *
 * Verifies a deployed origin the way a search engine and a visitor would: does every
 * URL answer with the expected status, do the legacy WordPress paths still redirect
 * instead of 404ing, does the Arabic slug resolve, and is the built page the one we
 * think it is (the tool count on the homepage is a cheap fingerprint of the commit).
 *
 *   node tools/check-live.mjs https://example.pages.dev
 */
const origin = (process.argv[2] ?? "https://tools.ly").replace(/\/$/, "");

/** [path, expectedStatus, note] */
const checks = [
  ["/", 200, "homepage"],
  ["/all-tools/", 200, "directory"],
  ["/scientific-calculator/", 200, "legacy tool"],
  ["/robot-game/", 200, "legacy tool"],
  ["/online-voice-recorder/", 200, "legacy page"],
  ["/506-2/", 200, "legacy post with an odd slug"],
  ["/%D9%85%D9%81%D9%83%D8%B1%D8%AA%D9%8A-%D8%A7%D9%84%D8%B3%D8%B1%D9%8A%D8%B9%D8%A9/", 200, "percent-encoded Arabic slug"],
  ["/7b3c2-about/", 200, "legacy page"],
  ["/7b3c2-contact/", 200, "legacy page"],
  ["/7b3c2-blog-archive/", 200, "legacy page"],
  ["/sitemap.xml", 200, "sitemap"],
  ["/robots.txt", 200, "robots"],
  ["/home/", 301, "old demo page must redirect"],
  ["/category/uncategorized/", 301, "WordPress taxonomy must redirect"],
  ["/author/admin/", 301, "WordPress author archive must redirect"],
  ["/feed/", 301, "WordPress feed must redirect"],
  ["/wp-login.php", 301, "WordPress plumbing must redirect"],
  ["/this-page-does-not-exist-9f2a/", 404, "unknown path must 404"],
];

const results = [];
let failures = 0;

for (const [path, expected, note] of checks) {
  let status = 0;
  let location = "";
  let body = "";
  try {
    const res = await fetch(`${origin}${path}`, { redirect: "manual" });
    status = res.status;
    location = res.headers.get("location") ?? "";
    if (res.status === 200) body = await res.text();
  } catch (error) {
    results.push([path, `FETCH ERROR: ${error.message}`, note]);
    failures += 1;
    continue;
  }

  const ok = status === expected;
  if (!ok) failures += 1;
  results.push([
    path,
    `${ok ? "OK " : "BAD"} ${status}${location ? ` -> ${location}` : ""}${expected !== status ? ` (expected ${expected})` : ""}`,
    note,
  ]);

  if (path === "/" && body) {
    const tools = body.match(/(\d+)\s*tools in the directory/);
    const live = body.match(/\*\*|>(\d+)<\/b>/) ? null : body.match(/(\d+)\s*live right now/);
    const team = body.includes("Tools.ly Team");
    const published = /Published\s+<time/.test(body);
    console.log(`  homepage fingerprints: directory=${tools?.[1] ?? "?"} live=${live?.[1] ?? "?"} teamByline=${team} dated=${published}`);
  }
}

const width = Math.max(...results.map((r) => r[0].length));
console.log(`\nChecked ${checks.length} URLs on ${origin}\n`);
for (const [path, verdict, note] of results) {
  console.log(`  ${path.padEnd(width)}  ${verdict.padEnd(34)} ${note}`);
}

console.log(failures === 0 ? "\nPASS — every URL behaved as expected" : `\n${failures} problem(s) found`);
process.exit(failures === 0 ? 0 : 1);
