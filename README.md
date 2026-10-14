# Tools.ly

The rebuilt tools.ly: a static site of free, browser-only utilities.

Every tool runs entirely on the visitor's device. There is no server-side code, no database,
no account system and no upload — which is why the whole thing can be hosted for free as static
files and why it keeps working offline once a page is open.

## Stack

| Concern | Choice |
| --- | --- |
| Site generator | [Astro](https://astro.build/) (static output, zero runtime framework) |
| Styling | One hand-written design system in `src/styles/global.css` |
| Tool logic | Plain vanilla JavaScript, scoped to each page |
| Hosting | Cloudflare Pages (build command `npm run build`, output directory `dist`) |
| Repository | https://github.com/Gamingmonster2/tools.ly |

## Commands

```bash
npm install          # install dependencies
npm run dev          # local dev server with hot reload
npm run build        # build the static site into dist/
npm run preview      # preview the built site
npm run check:urls   # run the migration guard (see below) — run this after every build
```

Visual check of the built output without the dev server:

```bash
node tools/serve-dist.mjs 4321     # then open http://127.0.0.1:4321/
```

## The one rule that must never break

**Every URL that existed on the old WordPress site must keep working, unchanged.**

Those addresses are indexed by search engines and linked from elsewhere. The rebuild therefore
keeps each legacy slug byte-for-byte, including the percent-encoded Arabic one
(`/مفكرتي-السريعة/`, which was `/%d9%85%d9%81%d9%83%d8%b1%d8%aa%d9%8a-.../`).

`npm run check:urls` enforces this. It:

1. reads the archived WordPress content in `_source/urls.json`,
2. proves each legacy URL produced a real page in `dist/`,
3. proves each page's `<title>`, meta description and canonical tag are present and correct,
4. proves every live tool appears in `sitemap.xml`,
5. proves no page loads a third-party script, stylesheet or font,
6. fails the run with a non-zero exit code if any of that is false.

Add `check:urls` to the Cloudflare Pages build command (`npm run build && npm run check:urls`)
so a broken URL can never reach production.

## Layout

```
.
├─ _source/               Archive of the old WordPress site (not published)
│  ├─ urls.json           every legacy URL — the contract the guard enforces
│  ├─ wp/                 posts, pages, categories, media and users as JSON
│  ├─ tools/              the original tool HTML extracted from each post
│  └─ html/               full rendered snapshots of the live pages
├─ public/
│  ├─ _redirects          legacy WordPress paths that should 301, not 404
│  ├─ robots.txt
│  └─ favicon.svg
├─ src/
│  ├─ data/tools.ts       single source of truth: every tool, category and canonical URL
│  ├─ layouts/            Base.astro (shell + SEO) and ToolLayout.astro (tool page skeleton)
│  ├─ components/         header, footer, breadcrumbs, icons, tool card, directory
│  ├─ pages/              one file per public URL; the filename *is* the slug
│  └─ styles/global.css   the design system (tokens + shared components)
├─ tests/url-integrity.mjs
└─ tools/                 helper scripts (archive the old site, serve the build)
```

## Adding a new tool

1. Add an entry to `src/data/tools.ts` and flip its `status` from `"soon"` to `"live"`.
2. Create `src/pages/<slug>.astro` using `ToolLayout`:

```astro
---
import ToolLayout from "../layouts/ToolLayout.astro";
import { allTools } from "../data/tools";
const tool = allTools.find((t) => t.slug === "<slug>")!;
---

<ToolLayout tool={tool} intro="One line shown under the H1." faqs={faqs} sources={sources}>
  <Fragment slot="tool">
    <div class="panel"><div class="panel__body"><!-- the tool --></div></div>
  </Fragment>

  <h2>How it works</h2>
  <p>Long-form content goes in the default slot.</p>
</ToolLayout>
```

`ToolLayout` already renders the breadcrumbs, H1, badges, FAQ, sources, related-tool links and the
privacy notice, so a new page only supplies the tool itself plus its prose.

### Two traps worth knowing

- **Use the design tokens.** Every colour, radius and shadow comes from a `--variable` in
  `global.css`. Hard-coding a hex value breaks dark mode.
- **Scoped styles do not reach JavaScript-created elements.** Astro scopes `<style>` by stamping a
  `data-astro-cid-*` attribute on elements in the template; nodes created later in JS never get it.
  Either render those nodes in the markup (preferred — it also works without JS), or use a
  namespaced `<style is:global>` block. `tests/url-integrity.mjs` prints an advisory note when a
  page mixes runtime element creation with a purely scoped style block.

## Deployment (Cloudflare Pages)

- Framework preset: Astro
- Build command: `npm run build && npm run check:urls`
- Output directory: `dist`
- Node version: 20 or newer

Production branch builds deploy to the custom domain; other branches get preview URLs, which is
how the staging check is done before switching `tools.ly` over.

After the switch, remember to:

1. add `https://tools.ly/sitemap.xml` in Google Search Console,
2. leave the old WordPress hosting running (but not serving the domain) for a week or two so any
   missed redirect surfaces,
3. only then delete the WordPress installation and its database.

## Health-tool content policy

The body-composition, calorie and ideal-weight tools use published formulas and database averages.
Every one of them carries a visible "estimates only, not medical advice" notice, cites its sources
with links, and states its limitations in the page body. Keep it that way when editing them.
