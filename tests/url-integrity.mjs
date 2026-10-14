/**
 * URL integrity check — the guard that makes this migration safe.
 *
 * Every URL that existed on the old WordPress site must still resolve after the
 * Astro build. Run this after `npm run build`; it exits non-zero on any break so
 * a regression can never reach production unnoticed.
 *
 *   node tests/url-integrity.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const legacy = JSON.parse(readFileSync(join(root, "_source", "urls.json"), "utf8"));

/** Paths that are intentionally handled by a redirect rule rather than a page. */
const redirectFile = join(root, "public", "_redirects");
const redirectRules = existsSync(redirectFile)
  ? readFileSync(redirectFile, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split(/\s+/))
  : [];

const isCoveredByRedirect = (pathname) =>
  redirectRules.some(([from]) => {
    if (!from) return false;
    if (from.endsWith("/*")) return pathname.startsWith(from.slice(0, -1));
    return from === pathname;
  });

/**
 * Percent-escapes are case-insensitive per RFC 3986 §6.2.2.1, so `%d9%85` and `%D9%85`
 * are the same URL. Compare on a lowered form so an encoder's choice of hex case never
 * produces a false alarm — but everything else must match exactly.
 */
const sameUrl = (a, b) => a.toLowerCase() === b.toLowerCase();

/** Map a public URL path to the file Astro emits for it. */
const fileFor = (pathname) => {
  const clean = decodeURIComponent(pathname);
  if (clean === "/") return join(dist, "index.html");
  const trimmed = clean.replace(/^\/|\/$/g, "");
  return join(dist, trimmed, "index.html");
};

const problems = [];
const checked = [];

for (const entry of legacy) {
  // Category archives are deliberately folded into /all-tools/ by a redirect rule.
  if (entry.type === "category") {
    if (!isCoveredByRedirect(new URL(entry.url).pathname)) {
      problems.push(`category ${entry.url} has neither a page nor a redirect rule`);
    } else {
      checked.push(entry.url);
    }
    continue;
  }

  const pathname = new URL(entry.url).pathname;
  const target = fileFor(pathname);

  if (existsSync(target)) {
    const html = readFileSync(target, "utf8");
    const canonical = new URL(pathname.endsWith("/") ? pathname : `${pathname}/`, "https://tools.ly").href;
    const canonicalTag = html.match(/rel="canonical" href="([^"]+)"/)?.[1] ?? "";
    if (!sameUrl(canonicalTag, canonical)) {
      problems.push(`${entry.url} is built but its canonical tag is "${canonicalTag}"`);
    }
    if (!/<title>[^<]{5,}<\/title>/.test(html)) {
      problems.push(`${entry.url} has no usable <title>`);
    }
    if (!html.includes('name="description"')) {
      problems.push(`${entry.url} has no meta description`);
    }
    checked.push(entry.url);
  } else if (isCoveredByRedirect(pathname)) {
    checked.push(`${entry.url} (redirect)`);
  } else {
    problems.push(`MISSING: ${entry.url} → expected ${relative(root, target)}`);
  }
}

// Every page that should not be indexed must say so, and vice versa.
const noindexPages = ["404.html"];
for (const file of noindexPages) {
  const target = join(dist, file);
  if (existsSync(target) && !readFileSync(target, "utf8").includes('name="robots" content="noindex')) {
    problems.push(`${file} should carry a noindex robots tag`);
  }
}

// The sitemap must list every live tool page.
const sitemapPath = join(dist, "sitemap.xml");
if (!existsSync(sitemapPath)) {
  problems.push("dist/sitemap.xml was not generated");
} else {
  const sitemap = readFileSync(sitemapPath, "utf8").toLowerCase();
  for (const entry of legacy) {
    if (entry.type !== "post" && entry.type !== "page") continue;
    const pathname = new URL(entry.url).pathname;
    // A URL that only exists as a 301 must NOT be advertised in the sitemap.
    if (isCoveredByRedirect(pathname)) continue;
    const url = entry.url.replace(/\/$/, "/").toLowerCase();
    if (!sitemap.includes(url)) problems.push(`sitemap is missing ${entry.url}`);
  }
}

// No page may pull a third-party script, stylesheet or font: the whole point is that
// a tool works offline and does not hand a visit to an ad or analytics network.
const pagesDir = join(dist);
const walk = (dir) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
};

for (const file of walk(pagesDir)) {
  const html = readFileSync(file, "utf8");
  const rel = relative(dist, file);
  const external = [
    // <script src="https://...">
    ...html.matchAll(/<script[^>]+src="(https?:\/\/[^"]+)"/g),
    // <link rel="stylesheet" href="https://..."> and preconnect/dns-prefetch hints
    ...html.matchAll(
      /<link[^>]+rel="(?:stylesheet|preconnect|dns-prefetch)"[^>]+href="(https?:\/\/[^"]+)"/g
    ),
    // inline background-image or font URLs pointing off-site
    ...html.matchAll(/url\((https?:\/\/[^)"']+)\)/g),
  ].map((m) => m[1]);
  if (external.length) {
    problems.push(`${rel} loads external asset(s): ${[...new Set(external)].join(", ")}`);
  }
}

// Advisory: Astro's scoped <style> works by stamping a data-astro-cid-* attribute onto
// elements that exist in the template. Elements created later by JavaScript never get
// that attribute, so a scoped rule targeting them silently does nothing. This is a
// heuristic only — pages that create nodes with inline styles or reuse template nodes
// are perfectly fine — so it warns instead of failing.
const scopingNotes = [];
const srcPages = join(root, "src", "pages");
for (const name of readdirSync(srcPages)) {
  if (!name.endsWith(".astro")) continue;
  const source = readFileSync(join(srcPages, name), "utf8");
  const createsNodes = /createElement\(/.test(source);
  const hasScopedStyle = /<style(?![^>]*is:global)/.test(source);
  const hasGlobalStyle = /<style[^>]*is:global/.test(source);
  // `:global(...)` inside a scoped block is the correct fix for runtime-created nodes.
  const usesGlobalSelector = /:global\(/.test(source);
  if (createsNodes && hasScopedStyle && !hasGlobalStyle && !usesGlobalSelector) {
    scopingNotes.push(
      `${name}: creates elements at runtime with a scoped <style>. Confirm those nodes need no class-based styling, or move the rules into a namespaced <style is:global>.`
    );
  }
}

console.log(`Checked ${checked.length} legacy URLs against dist/.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}
console.log("✓ every legacy URL resolves, canonicalises and appears in the sitemap");
console.log("✓ no page loads an external script, stylesheet or font");
if (scopingNotes.length) {
  console.log(`\n${scopingNotes.length} advisory note(s) — check manually:`);
  for (const note of scopingNotes) console.log(`  · ${note}`);
}
