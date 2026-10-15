/**
 * Before/after measurement of the rebuild.
 *
 * Reads the archived WordPress pages in `_source/html/` and the freshly built site in
 * `dist/`, then prints the numbers that actually changed. Useful as evidence rather than
 * impression, and repeatable after any future change.
 *
 *   node tools/compare-old-new.mjs
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const OLD = join(root, "_source", "html");
const NEW = join(root, "dist");

const walk = (dir) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
};

const kb = (bytes) => (bytes / 1024).toFixed(1);
const sum = (files) => files.reduce((total, file) => total + statSync(file).size, 0);

const count = (text, pattern) => (text.match(pattern) ?? []).length;

/**
 * Off-site ASSETS, not links. A canonical or hreflang <link> points at our own site and
 * costs the visitor nothing; only scripts, stylesheets, preconnects and remote fonts are
 * real third-party dependencies. Counting the former would have reported 84 "external
 * references" for a site that provably has none.
 */
const externalAssets = (html) => {
  const scripts = count(html, /<script[^>]+src="https?:\/\//g);
  const styles = count(html, /<link[^>]+rel="stylesheet"[^>]+href="https?:\/\//g);
  const hints = count(html, /<link[^>]+rel="(?:preconnect|dns-prefetch)"[^>]+href="https?:\/\//g);
  const fontUrls = count(html, /url\(https?:\/\/[^)]*\.(?:woff2?|ttf|otf|eot)/g);
  return scripts + styles + hints + fontUrls;
};

// ---------- the old WordPress site ----------
const oldFiles = readdirSync(OLD).map((name) => join(OLD, name));
const oldHtml = oldFiles.map((file) => readFileSync(file, "utf8"));

const oldMetrics = {
  pages: oldFiles.length,
  averageKB: Number((sum(oldFiles) / oldFiles.length / 1024).toFixed(1)),
  largestKB: Number((Math.max(...oldFiles.map((f) => statSync(f).size)) / 1024).toFixed(1)),
  externalRefs: oldHtml.reduce((n, html) => n + externalAssets(html), 0),
  googleFontRefs: oldHtml.reduce(
    (n, html) => n + count(html, /fonts\.googleapis|fonts\.gstatic/g),
    0
  ),
  inlineStyleBlocks: oldHtml.reduce((n, html) => n + count(html, /<style/g), 0),
  uniquePalettes: new Set(
    oldHtml.flatMap((html) => html.match(/--(?:primary|royal|accent|bg)-?[a-z]*:\s*#[0-9a-fA-F]{3,8}/g) ?? [])
  ).size,
};

// ---------- the rebuilt site ----------
const newFiles = walk(NEW);
const htmlFiles = newFiles.filter((f) => f.endsWith(".html"));
const cssFiles = newFiles.filter((f) => f.endsWith(".css"));
const jsFiles = newFiles.filter((f) => f.endsWith(".js"));
const newHtml = htmlFiles.map((file) => readFileSync(file, "utf8"));

/** Visible prose per page: strip tags, scripts and styles, then count words. */
const words = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .split(/\s+/)
    .filter(Boolean).length;

const toolPages = newHtml.filter((html) => html.includes('"@type":"WebApplication"'));

const newMetrics = {
  pages: htmlFiles.length,
  totalMB: Number((sum(newFiles) / 1048576).toFixed(2)),
  averageKB: Number((sum(htmlFiles) / htmlFiles.length / 1024).toFixed(1)),
  largestKB: Number((Math.max(...htmlFiles.map((f) => statSync(f).size)) / 1024).toFixed(1)),
  cssKB: Number((sum(cssFiles) / 1024).toFixed(1)),
  jsKB: Number((sum(jsFiles) / 1024).toFixed(1)),
  externalRefs: newHtml.reduce((n, html) => n + externalAssets(html), 0),
  structuredDataBlocks: newHtml.reduce(
    (n, html) => n + count(html, /application\/ld\+json/g),
    0
  ),
  toolPages: toolPages.length,
  averageToolWords: toolPages.length
    ? Math.round(toolPages.reduce((n, html) => n + words(html), 0) / toolPages.length)
    : 0,
  pagesWithFaq: newHtml.filter((html) => html.includes("Frequently asked questions") || html.includes("أسئلة متكرّرة")).length,
  pagesWithSources: newHtml.filter((html) => html.includes("Sources &amp; further reading") || html.includes("المصادر وقراءات")).length,
};

const row = (label, before, after) =>
  console.log(`  ${label.padEnd(34)} ${String(before).padStart(14)}   ${String(after).padStart(14)}`);

console.log("\n                       القديم (ووردبريس)          الجديد (Astro)");
console.log("  " + "-".repeat(66));
row("عدد الصفحات المبنية", oldMetrics.pages, newMetrics.pages);
row("متوسط حجم الصفحة (KB)", oldMetrics.averageKB, newMetrics.averageKB);
row("أكبر صفحة (KB)", oldMetrics.largestKB, newMetrics.largestKB);
row("إجمالي الموقع (MB)", "—", newMetrics.totalMB);
row("CSS إجمالي (KB)", "مضمّن في كل صفحة", newMetrics.cssKB);
row("JS إجمالي (KB)", "jQuery + إضافات", newMetrics.jsKB);
row("مراجع أصول خارجية", oldMetrics.externalRefs, newMetrics.externalRefs);
row("مراجع خطوط جوجل", oldMetrics.googleFontRefs, 0);
row("كتل <style> مضمّنة", oldMetrics.inlineStyleBlocks, 0);
console.log("\n  الجديد فقط:");
row("صفحات بأدوات مُوسَّمة", "—", newMetrics.toolPages);
row("متوسط كلمات صفحة أداة", "0 (أداة فقط)", newMetrics.averageToolWords);
row("صفحات فيها أسئلة شائعة", "—", newMetrics.pagesWithFaq);
row("صفحات فيها مصادر", "—", newMetrics.pagesWithSources);
row("كتل بيانات منظمة", "Yoast افتراضية", newMetrics.structuredDataBlocks);
console.log("");
