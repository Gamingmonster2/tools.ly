/**
 * Dynamic-style guard.
 *
 * Astro's scoped <style> works by stamping a data-astro-cid-* attribute onto the elements
 * that exist in the template. An element created later by JavaScript never receives that
 * attribute, so a scoped rule can never match it — the node ships with no styling at all.
 *
 * This check finds class names that a page assigns to elements in JavaScript and verifies
 * that each one has at least one rule in the built CSS which does NOT require the scope
 * attribute (i.e. it was written inside `:global(...)` or a `<style is:global>` block).
 *
 *   node tests/dynamic-styles.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const srcPages = join(root, "src", "pages");

/** Collect the classes a page applies to DOM nodes at runtime. */
const runtimeClasses = (source) => {
  const found = new Map();

  const add = (raw, where) => {
    for (const name of String(raw).split(/\s+/)) {
      const clean = name.trim();
      if (!clean || !/^[A-Za-z][\w-]*$/.test(clean)) continue;
      if (!found.has(clean)) found.set(clean, where);
    }
  };

  // className = "a b"  /  className = `a b`  /  className = 'a'
  for (const m of source.matchAll(/\.className\s*=\s*(["'`])([^"'`]+)\1/g)) add(m[2], "className");
  // setAttribute("class", "a b")
  for (const m of source.matchAll(/setAttribute\(\s*["']class["']\s*,\s*(["'`])([^"'`]+)\1/g)) add(m[2], "setAttribute");
  // classList.add("a") / classList.toggle("a")
  for (const m of source.matchAll(/classList\.(?:add|toggle)\(\s*["']([^"']+)["']/g)) add(m[1], "classList");

  return found;
};

/** Every class selector in a stylesheet, and whether it is scope-locked. */
const selectorAudit = (css) => {
  /** @type {Map<string, {anyUnlocked: boolean}>} */
  const audit = new Map();

  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const block of withoutComments.matchAll(/([^{}]+)\{/g)) {
    const selector = block[1];
    if (selector.trim().startsWith("@")) continue; // @media and friends

    // A compound selector is a run of simple selectors with no combinator between them,
    // e.g. `.robo-btn[data-astro-cid-x].is-talking`. If the scope attribute appears
    // anywhere in that compound, every class in it is locked to scoped elements.
    // If it appears only in an ancestor compound (`.a[cid] .b`), then `.b` is free.
    for (const compound of selector.split(/\s*[>+~]\s*|\s+/)) {
      if (!compound) continue;
      const compoundLocked = /\[data-astro-cid-[\w-]+\]/.test(compound);
      for (const m of compound.matchAll(/\.([A-Za-z][\w-]*)/g)) {
        const name = m[1];
        const entry = audit.get(name) ?? { anyUnlocked: false };
        if (!compoundLocked) entry.anyUnlocked = true;
        audit.set(name, entry);
      }
    }
  }
  return audit;
};

const cssFor = (htmlFile) => {
  const dir = join(htmlFile, "..");
  const html = readFileSync(htmlFile, "utf8");
  const hrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  let css = "";
  for (const href of hrefs) {
    const file = join(dist, href.replace(/^\//, ""));
    if (existsSync(file)) css += readFileSync(file, "utf8");
  }
  return css;
};

const notes = [];
let inspected = 0;

for (const name of readdirSync(srcPages)) {
  if (!name.endsWith(".astro")) continue;
  const source = readFileSync(join(srcPages, name), "utf8");
  const classes = runtimeClasses(source);
  if (classes.size === 0) continue;

  const slug = name.replace(/\.astro$/, "");
  // An Astro page emits dist/<slug>/index.html; index.astro and 404 are special.
  const candidates = [
    join(dist, slug, "index.html"),
    join(dist, "index.html"),
    join(dist, `${slug}.html`),
  ];
  const htmlFile = candidates.find((c) => existsSync(c));
  if (!htmlFile) continue;

  const audit = selectorAudit(cssFor(htmlFile));
  inspected += 1;

  for (const [className, where] of classes) {
    const entry = audit.get(className);
    // No rule at all: the class is a pure JS hook (common and harmless), so say nothing.
    if (!entry) continue;
    if (!entry.anyUnlocked) {
      notes.push(
        `${name}: "${className}" is set from JS (${where}) and every rule for it is scope-locked on the class itself. Safe only if the element comes from the template — check it, or use :global(...).`
      );
    }
  }
}

console.log(`Audited runtime-assigned classes on ${inspected} page(s).`);
console.log("This is a heuristic, not a gate: adding a class to a template element that already");
console.log("carries the scope attribute is correct and common. Review each note by hand.\n");
if (notes.length) {
  console.log(`${notes.length} class(es) worth a manual look:`);
  for (const note of notes) console.log(`  · ${note}`);
} else {
  console.log("✓ no runtime-assigned class is locked behind the style-scope attribute");
}
