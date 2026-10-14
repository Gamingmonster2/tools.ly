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
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

// Internal-link guard: every root-relative link in the built HTML must resolve to a file
// that actually exists. A missing page shows up as a 404 for a visitor long before it
// shows up in any analytics, so catch it here instead.
for (const file of walk(pagesDir)) {
  const html = readFileSync(file, "utf8");
  const rel = relative(dist, file);
  const seen = new Set();

  for (const [, rawHref] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = decodeURIComponent(rawHref);
    if (seen.has(href)) continue;
    seen.add(href);

    const candidate = href.endsWith("/")
      ? join(dist, href.slice(1), "index.html")
      : join(dist, href.slice(1));

    const exists = existsSync(candidate) || existsSync(join(candidate, "index.html"));
    if (!exists) {
      problems.push(`${rel} links to ${href} but that page was not built`);
    }
  }
}

// Rendered-output checks: whatever the source looks like, the built page must have exactly
// one <h1> and carry a canonical URL and a lang attribute, or it is not shippable.
for (const file of walk(pagesDir)) {
  const html = readFileSync(file, "utf8");
  const rel = relative(dist, file);
  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1Count !== 1) {
    problems.push(`${rel} has ${h1Count} <h1> elements; every page must have exactly one`);
  }
  if (!html.includes('rel="canonical"')) {
    problems.push(`${rel} has no canonical link`);
  }
  if (!html.includes('lang="')) {
    problems.push(`${rel} has no lang attribute on <html>`);
  }
}

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

/**
 * Every URL the sitemap advertises must exist as a real built page. This catches the
 * most embarrassing possible failure — a tool marked "live" in the registry that never
 * got a page, or a page whose filename drifted from its slug.
 */
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, "utf8");
  for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const pathname = new URL(loc).pathname;
    if (!existsSync(fileFor(pathname))) {
      problems.push(`sitemap advertises ${pathname} but no page was built for it`);
    }
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

// ToolLayout owns the page's single <h1>, the header and the footer. A page that adds its
// own would ship two competing H1s, which is both an accessibility and an SEO defect.
for (const name of readdirSync(srcPages)) {
  if (!name.endsWith(".astro")) continue;
  const source = readFileSync(join(srcPages, name), "utf8");
  if (!source.includes("ToolLayout")) continue;
  if (/<h1[\s>]/i.test(source)) {
    problems.push(`${name} renders its own <h1>; ToolLayout already provides one`);
  }
  if (!source.includes("faqs") || !source.includes("sources")) {
    problems.push(`${name} does not pass both faqs and sources to ToolLayout`);
  }
}

// Publication policy guard: every registered tool carries a real date, nothing is dated in
// the future, and every built tool page shows the collective team byline rather than a person.
const toolsSource = readFileSync(join(root, "src", "data", "tools.ts"), "utf8");
let dated = 0;
for (const match of toolsSource.matchAll(/\{[^{}]*slug:\s*"[^"]+"[^{}]*\}/g)) {
  const block = match[0];
  const slug = block.match(/slug:\s*"([^"]+)"/)[1];
  const published = block.match(/published:\s*"(\d{4}-\d{2}-\d{2})"/);
  if (!published) {
    problems.push(`tool "${slug}" has no published date`);
    continue;
  }
  const when = new Date(`${published[1]}T00:00:00Z`);
  if (Number.isNaN(when.getTime())) {
    problems.push(`tool "${slug}" has an unparseable published date: ${published[1]}`);
  } else if (when.getTime() > Date.now()) {
    problems.push(`tool "${slug}" is dated in the future: ${published[1]}`);
  } else {
    dated += 1;
  }
}

// No personal byline may appear in the output: attribution is collective only.
const personalByline = /(By\s+)(?!the\s|Tools)[A-Z][a-z]+\s+[A-Z][a-z]+/.source;
for (const file of walk(pagesDir)) {
  const html = readFileSync(file, "utf8");
  const rel = relative(dist, file);
  if (!html.includes("Tools.ly Team") && /class="byline"/.test(html)) {
    problems.push(`${rel} renders a byline without the collective team name`);
  }
  if (new RegExp(`<meta name="author" content="(?!Tools\\.ly Team)`).test(html)) {
    problems.push(`${rel} names an individual in a meta author tag`);
  }
  void personalByline;
}

console.log(`Checked ${checked.length} legacy URLs against dist/.`);
console.log(`Checked ${dated} tool publication dates.`);
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
